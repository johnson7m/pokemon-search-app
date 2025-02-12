// src/contexts/TasksContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  onSnapshot,
  increment,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuthContext } from './AuthContext';
import { addXp, updateUserStats } from '../services/statisticsService';

const TasksContext = createContext();

export const TasksProvider = ({ children }) => {
  const { user } = useAuthContext();

  // Global tasks (daily, weekly, monthly)
  const [dailyTasks, setDailyTasks] = useState([]);
  const [weeklyTasks, setWeeklyTasks] = useState([]);
  const [monthlyTasks, setMonthlyTasks] = useState([]);

  // Accepted tasks for this user
  const [acceptedTasks, setAcceptedTasks] = useState([]);

  // 1) Load global tasks
  useEffect(() => {
    const loadGlobalTasks = async () => {
      try {
        const tasksRef = collection(db, 'tasks');

        const dailyQ = query(tasksRef, where('taskType', '==', 'daily'));
        const dailySnap = await getDocs(dailyQ);
        setDailyTasks(dailySnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const weeklyQ = query(tasksRef, where('taskType', '==', 'weekly'));
        const weeklySnap = await getDocs(weeklyQ);
        setWeeklyTasks(weeklySnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const monthlyQ = query(tasksRef, where('taskType', '==', 'monthly'));
        const monthlySnap = await getDocs(monthlyQ);
        setMonthlyTasks(monthlySnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error('Error loading global tasks:', error);
      }
    };
    loadGlobalTasks();
  }, []);

  // 2) Listen for user’s accepted tasks
  useEffect(() => {
    if (!user) {
      setAcceptedTasks([]);
      return;
    }
    const acceptedRef = collection(db, 'userTasks', user.uid, 'acceptedTasks');
    const unsubscribe = onSnapshot(acceptedRef, (snapshot) => {
      const userTasks = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setAcceptedTasks(userTasks);
    });

    return () => unsubscribe();
  }, [user]);

  /**
   * Accept a task => copy progressModules (if multi-subgoals).
   * If no progressModules, treat as single sub-goal with {progressGoal, currentProgress, isCompleted} at the root.
   */
  const acceptTask = async (taskDoc) => {
    if (!user) return;
    try {
      const acceptedRef = collection(db, 'userTasks', user.uid, 'acceptedTasks');

      let payload;
      if (taskDoc.progressModules) {
        // Multi-subgoal scenario
        const modulesCopy = {};
        for (const [modKey, modVal] of Object.entries(taskDoc.progressModules)) {
          modulesCopy[modKey] = {
            ...modVal,
            currentProgress: 0,
            isCompleted: false, // each sub-goal starts incomplete
          };
        }
        payload = {
          taskId: taskDoc.id,
          title: taskDoc.title,
          description: taskDoc.description,
          taskType: taskDoc.taskType,
          difficulty: taskDoc.difficulty,
          xpReward: taskDoc.xpReward || 0,
          progressModules: modulesCopy,
          acceptedAt: new Date(),
          isCompleted: false,
          completedAt: null,
        };
      } else {
        // Single sub-goal fallback
        payload = {
          taskId: taskDoc.id,
          title: taskDoc.title,
          description: taskDoc.description,
          taskType: taskDoc.taskType,
          difficulty: taskDoc.difficulty,
          xpReward: taskDoc.xpReward || 0,
          // single sub-goal data
          progressGoal: taskDoc.progressGoal || 1,
          currentProgress: 0,
          isCompleted: false,
          acceptedAt: new Date(),
          completedAt: null,
        };
      }

      await addDoc(acceptedRef, payload);
      console.log(`Accepted task: ${taskDoc.title}`);
    } catch (error) {
      console.error('Error accepting task:', error);
    }
  };

  /**
   * updateTaskProgress(acceptedTask, progressType, incrementBy)
   * - If multi-subgoal => find modules that match progressType, increment them,
   *   set them isCompleted = true if they hit goal. But do NOT complete entire task.
   * - If single sub-goal => just increment currentProgress and set isCompleted if it hits the goal.
   *   Still do NOT complete entire task at doc level.
   */
  const updateTaskProgress = async (acceptedTask, progressType, incrementBy = 1, moduleKey = null) => {
    if (!user || acceptedTask.isCompleted) return;
    try {
      const acceptedDocRef = doc(db, 'userTasks', user.uid, 'acceptedTasks', acceptedTask.id);

      if (acceptedTask.progressModules) {
        // Multi-subgoal
        const newModules = { ...acceptedTask.progressModules };

        if (moduleKey && newModules[moduleKey]) {
          // Update only the specified module.
          const modVal = newModules[moduleKey];
          if (modVal.progressType === progressType && !modVal.isCompleted) {
            let newVal = (modVal.currentProgress || 0) + incrementBy;
            if (newVal >= modVal.progressGoal) {
              newVal = modVal.progressGoal;
              modVal.isCompleted = true;
            }
            modVal.currentProgress = newVal;
          }
        } else {
          // Fallback: update all modules matching progressType.
          Object.entries(newModules).forEach(([modKey, modVal]) => {
            if (modVal.progressType === progressType && !modVal.isCompleted) {
              let newVal = (modVal.currentProgress || 0) + incrementBy;
              if (newVal >= modVal.progressGoal) {
                newVal = modVal.progressGoal;
                modVal.isCompleted = true;
              }
              modVal.currentProgress = newVal;
            }
          });
        }
        await updateDoc(acceptedDocRef, { progressModules: newModules });
      } else {
        // Single sub-goal fallback
        let newVal = (acceptedTask.currentProgress || 0) + incrementBy;
        const updates = { currentProgress: Math.min(newVal, acceptedTask.progressGoal || 1) };
        await updateDoc(acceptedDocRef, updates);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };


  /**
   * completeTask => user explicitly clicks "Complete" button once ALL sub-goals are done.
   * We check if the sub-goals are indeed done. If so, set entire doc isCompleted = true,
   * completedAt, award XP, increment tasksCompleted, etc.
   */
  const completeTask = async (acceptedTask, xpTrigger) => {
    if (!user || acceptedTask.isCompleted) return;
    try {
      const acceptedDocRef = doc(db, 'userTasks', user.uid, 'acceptedTasks', acceptedTask.id);

      // 1) If multi-subgoal, ensure all sub-goals are isCompleted
      let allDone = true;
      if (acceptedTask.progressModules) {
        for (const mod of Object.values(acceptedTask.progressModules)) {
          if (!mod.isCompleted) {
            allDone = false;
            break;
          }
        }
      } else {
        // single sub-goal => check if currentProgress >= progressGoal
        if ((acceptedTask.currentProgress || 0) < (acceptedTask.progressGoal || 1)) {
          allDone = false;
        }
      }

      if (!allDone) {
        console.log(`Cannot complete task ${acceptedTask.title}, sub-goals not finished.`);
        return;
      }

      // 2) Mark entire doc as completed
      await updateDoc(acceptedDocRef, {
        isCompleted: true,
        completedAt: new Date(),
      });

      // 3) Award XP once
      if (acceptedTask.xpReward) {
        await addXp(user.uid, acceptedTask.xpReward, xpTrigger);
      }
      await updateUserStats(user.uid, { tasksCompleted: increment(1) });

      console.log(`User manually completed task: ${acceptedTask.title}`);
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  return (
    <TasksContext.Provider
      value={{
        dailyTasks,
        weeklyTasks,
        monthlyTasks,
        acceptedTasks,
        acceptTask,
        updateTaskProgress,
        completeTask,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};

export const useTasksContext = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasksContext must be used within a TasksProvider');
  }
  return context;
};
