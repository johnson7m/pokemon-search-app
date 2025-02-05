// tasksRefreshService.js
import { db } from '../firebase';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import dayjs from 'dayjs'; // or moment.js or plain Date math

const DAILY_HOURS = 24;
const WEEKLY_HOURS = 24 * 7;
const MONTHLY_HOURS = 24 * 30;

export const checkAndRefreshTasks = async (userId) => {
  const userStatsRef = doc(db, 'userStatistics', userId);
  const snap = await getDoc(userStatsRef);
  if (!snap.exists()) return;

  const data = snap.data();
  const now = dayjs();
  
  const { lastDailyRefresh, lastWeeklyRefresh, lastMonthlyRefresh } = data;

  // If lastDailyRefresh + 24 hours < now => tasks are expired
  if (!lastDailyRefresh || dayjs(lastDailyRefresh.toDate()).add(DAILY_HOURS, 'hour').isBefore(now)) {
    // Clear daily accepted tasks:
    await clearAcceptedTasks(userId, 'daily');
    // Update lastDailyRefresh = now
    await updateDoc(userStatsRef, { lastDailyRefresh: new Date() });
  }

  if (!lastWeeklyRefresh || dayjs(lastWeeklyRefresh.toDate()).add(WEEKLY_HOURS, 'hour').isBefore(now)) {
    // Clear daily accepted tasks:
    await clearAcceptedTasks(userId, 'weekly');
    // Update lastWeeklyRefresh = now
    await updateDoc(userStatsRef, { lastWeeklyRefresh: new Date() });
  }

  if (!lastMonthlyRefresh || dayjs(lastMonthlyRefresh.toDate()).add(MONTHLY_HOURS, 'hour').isBefore(now)) {
    // Clear daily accepted tasks:
    await clearAcceptedTasks(userId, 'monthly');
    // Update lastMonthlyHours = now
    await updateDoc(userStatsRef, { lastMonthlyRefresh: new Date() });
  }

  console.log('Tasks refreshed!')
};

const clearAcceptedTasks = async (userId, taskType) => {
  const acceptedTasksRef = collection(db, 'userTasks', userId, 'acceptedTasks');
  const snapshot = await getDocs(acceptedTasksRef);
  for (const docSnap of snapshot.docs) {
    const t = docSnap.data();
    if (t.taskType === taskType) {
      await deleteDoc(docSnap.ref);
    }
  }
};
