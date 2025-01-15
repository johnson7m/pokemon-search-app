// src/utils/firestoreLogger.js
import { getDocs, addDoc, query, where, deleteDoc } from 'firebase/firestore';

export const logFirestoreRequest = async (operation, ...args) => {
  console.log(`[Firestore] ${operation}:`, args);
  try {
    switch (operation) {
      case 'getDocs':
        return await getDocs(...args);
      case 'addDoc':
        return await addDoc(...args);
      case 'query':
        return query(...args);
      case 'where':
        return where(...args);
      case 'deleteDoc':
        return await deleteDoc(...args);
      default:
        throw new Error(`Unknown Firestore operation: ${operation}`);
    }
  } catch (error) {
    console.error(`[Firestore Error] ${operation}:`, error);
    throw error;
  }
};
