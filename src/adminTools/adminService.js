// src/services/adminService.js
import { collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const clearAllTasks = async () => {
  try {
    const tasksSnap = await getDocs(collection(db, 'tasks'));
    const batchSize = tasksSnap.size;
    if (batchSize === 0) {
      console.log('No tasks to clear.');
      return;
    }
    for (const docSnap of tasksSnap.docs) {
      await deleteDoc(docSnap.ref);
    }
    console.log(`Cleared all ${batchSize} tasks from 'tasks' collection.`);
  } catch (error) {
    console.error('Error clearing tasks collection:', error);
  }
};
