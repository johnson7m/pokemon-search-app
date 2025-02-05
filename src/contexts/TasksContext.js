import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuthContext } from './AuthContext';
import { updateUserStats } from '../services/statisticsService';
// If you have an XP awarding service or function:
import { addXp } from '../services/statisticsService';

const TasksContext = createContext();

export const TasksProvider = ({ children }) => {
  const { user } = useAuthContext();

  // Global tasks
  const [dailyTasks, setDailyTasks] = useState([]);
  const [weeklyTasks, setWeeklyTasks] = useState([]);
  const [monthlyTasks, setMonthlyTasks] = useState([]);

  // User-specific tasks
  const [acceptedTasks, setAcceptedTasks] = useState([]); // array of docs from userTasks/{uid}/acceptedTasks

  useEffect(() => {
    // 1) Load global tasks from "tasks" collection
    //    Optionally filter out tasks that are "daily", "weekly", "monthly"
    const loadGlobalTasks = async () => {
      try {
        const tasksRef = collection(db, 'tasks');

        // You might do something like a single getDocs and partition them,
        // but for clarity, let's do one getDocs per type:
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

  useEffect(() => {
    // 2) Set up a real-time listener for user's accepted tasks if the user is logged in
    if (!user) {
      setAcceptedTasks([]);
      return;
    }

    const acceptedRef = collection(db, 'userTasks', user.uid, 'acceptedTasks');
    const unsubscribe = onSnapshot(acceptedRef, (snapshot) => {
      const userTasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAcceptedTasks(userTasks);
    });

    return () => unsubscribe();
  }, [user]);

  /**
   * Accept a task by copying relevant fields into userTasks/{uid}/acceptedTasks.
   * If you only want the user to accept a task once, check for duplicates first.
   */
  const acceptTask = async (taskDoc) => {
    if (!user) return;
    try {
      const acceptedRef = collection(db, 'userTasks', user.uid, 'acceptedTasks');
      // Create doc with initial fields
      const payload = {
        taskId: taskDoc.id,
        title: taskDoc.title,
        description: taskDoc.description,
        taskType: taskDoc.taskType,
        category: taskDoc.category,
        difficulty: taskDoc.difficulty,
        xpReward: taskDoc.xpReward || 0,
        // For progress-based tasks:
        progressType: taskDoc.progressType || null,
        progressGoal: taskDoc.progressGoal || 0,
        currentProgress: 0,
        // Timestamps
        acceptedAt: new Date(),
        isCompleted: false,
        completedAt: null,
      };
      await addDoc(acceptedRef, payload);
      console.log(`Accepted task: ${taskDoc.title}`);
    } catch (error) {
      console.error('Error accepting task:', error);
    }
  };

  /**
   * Increment or update progress. E.g., if user searches for a Water-type,
   * you might call updateTaskProgress for any "search" tasks in progress.
   */
  const updateTaskProgress = async (acceptedTask, incrementBy = 1) => {
    if (!user) return;
    try {
      const acceptedDocRef = doc(db, 'userTasks', user.uid, 'acceptedTasks', acceptedTask.id);
  
      const newProgress = (acceptedTask.currentProgress || 0) + incrementBy;
      let updates = {
        currentProgress: newProgress,
      };
  
      // If we've reached or exceeded the goal, mark as completed
      if (newProgress >= (acceptedTask.progressGoal || 1)) {
        updates.isCompleted = true;
        updates.completedAt = new Date();
        // Award XP here or in "completeTask" if you prefer
        if (acceptedTask.xpReward) {
          await addXp(user.uid, acceptedTask.xpReward);
        }
      }
  
      await updateDoc(acceptedDocRef, updates);
    } catch (error) {
      console.error('Error updating task progress:', error);
    }
  };

  /**
   * For tasks that are completed via a single event (e.g., finishing a trivia question),
   * you can call completeTask to set isCompleted=true, completedAt, and award XP.
   */
  const completeTask = async (acceptedTask, xpTrigger) => {
    if (!user) return;
    try {
      const acceptedDocRef = doc(db, 'userTasks', user.uid, 'acceptedTasks', acceptedTask.id);
      await updateDoc(acceptedDocRef, {
        isCompleted: true,
        completedAt: new Date(),
      });
      // Award XP
      if (acceptedTask.xpReward) {
        await addXp(user.uid, acceptedTask.xpReward, xpTrigger);
      }

      await updateUserStats(user.uid, {
        tasksCompleted: + 1,
      });
      console.log(`Completed task: ${acceptedTask.title}`);
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
