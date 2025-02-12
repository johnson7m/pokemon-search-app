// src/services/tasksRefreshService.js
import { db } from '../firebase';
import { firestoreOperation } from '../utils/firestoreWrapper';
import { doc, collection } from 'firebase/firestore';
import dayjs from 'dayjs';

const DAILY_HOURS = 24;
const WEEKLY_HOURS = 24 * 7;
const MONTHLY_HOURS = 24 * 30;

export const checkAndRefreshTasks = async (userId) => {
  try {
    const userStatsRef = doc(db, 'userStatistics', userId);
    const keyGetDoc = `checkAndRefreshTasks_getDoc_${userId}`;
    // Bypass cache so that we always have the current refresh times
    const snap = await firestoreOperation(
      'getDoc',
      keyGetDoc,
      'checkAndRefreshTasks',
      { useCache: false },
      userStatsRef
    );
    if (!snap.exists()) return;
    const data = snap.data();
    const now = dayjs();

    // If the stored refresh value is a Firestore Timestamp, call toDate(), else use directly.
    const getDate = (ts) => (ts && ts.toDate ? ts.toDate() : ts);

    const { lastDailyRefresh, lastWeeklyRefresh, lastMonthlyRefresh } = data;

    if (!lastDailyRefresh || dayjs(getDate(lastDailyRefresh)).add(DAILY_HOURS, 'hour').isBefore(now)) {
      await clearAcceptedTasks(userId, 'daily');
      const keyUpdateDocDaily = `checkAndRefreshTasks_updateDoc_daily_${userId}`;
      await firestoreOperation(
        'updateDoc',
        keyUpdateDocDaily,
        'checkAndRefreshTasks',
        {},
        userStatsRef,
        { lastDailyRefresh: new Date() }
      );
    }
    if (!lastWeeklyRefresh || dayjs(getDate(lastWeeklyRefresh)).add(WEEKLY_HOURS, 'hour').isBefore(now)) {
      await clearAcceptedTasks(userId, 'weekly');
      const keyUpdateDocWeekly = `checkAndRefreshTasks_updateDoc_weekly_${userId}`;
      await firestoreOperation(
        'updateDoc',
        keyUpdateDocWeekly,
        'checkAndRefreshTasks',
        {},
        userStatsRef,
        { lastWeeklyRefresh: new Date() }
      );
    }
    if (!lastMonthlyRefresh || dayjs(getDate(lastMonthlyRefresh)).add(MONTHLY_HOURS, 'hour').isBefore(now)) {
      await clearAcceptedTasks(userId, 'monthly');
      const keyUpdateDocMonthly = `checkAndRefreshTasks_updateDoc_monthly_${userId}`;
      await firestoreOperation(
        'updateDoc',
        keyUpdateDocMonthly,
        'checkAndRefreshTasks',
        {},
        userStatsRef,
        { lastMonthlyRefresh: new Date() }
      );
    }
    console.log('Tasks refreshed!');
  } catch (error) {
    console.error('Error refreshing tasks:', error);
  }
};

const clearAcceptedTasks = async (userId, taskType) => {
  try {
    const acceptedTasksRef = collection(db, 'userTasks', userId, 'acceptedTasks');
    const keyGetDocs = `clearAcceptedTasks_getDocs_${userId}_${taskType}`;
    // Always bypass cache when clearing accepted tasks
    const snapshot = await firestoreOperation(
      'getDocs',
      keyGetDocs,
      'clearAcceptedTasks',
      { useCache: false },
      acceptedTasksRef
    );
    for (const docSnap of snapshot.docs) {
      const t = docSnap.data();
      // Use a case-insensitive comparison so that "Daily" equals "daily"
      if (t.taskType && t.taskType.toLowerCase() === taskType.toLowerCase()) {
        const keyDeleteDoc = `clearAcceptedTasks_deleteDoc_${docSnap.id}`;
        await firestoreOperation(
          'deleteDoc',
          keyDeleteDoc,
          'clearAcceptedTasks',
          {},
          docSnap.ref
        );
      }
    }
  } catch (error) {
    console.error('Error clearing accepted tasks:', error);
  }
};
