import {
  getDocs,
  addDoc,
  query,
  where,
  deleteDoc,
  updateDoc,
  setDoc,
  getDoc,
} from 'firebase/firestore';

// Helper to try to determine caller information from the stack.
const getCallerInfo = () => {
  const error = new Error();
  if (error.stack) {
    const stackLines = error.stack.split('\n');
    // Adjust the index if needed (here we take line 3 as the caller)
    return stackLines[3] ? stackLines[3].trim() : 'unknown';
  }
  return 'unknown';
};

/**
 * Logs a Firestore request and then executes it.
 *
 * @param {string} operation - The Firestore operation (e.g., 'getDocs', 'addDoc', etc.)
 * @param {string} context - Optional context string (e.g. parent component or service function name)
 * @param  {...any} args - The arguments for the underlying Firestore function.
 * @returns {Promise<any>} - The result of the Firestore call.
 */
export const logFirestoreRequest = async (operation, context, ...args) => {
  const callerInfo = context || getCallerInfo();
  console.log(`[Firestore] ${operation} called by ${callerInfo}:`, args);
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
      case 'updateDoc':
        return await updateDoc(...args);
      case 'setDoc':
        return await setDoc(...args);
      case 'getDoc':
        return await getDoc(...args);
      default:
        throw new Error(`Unknown Firestore operation: ${operation}`);
    }
  } catch (error) {
    console.error(
      `[Firestore Error] ${operation} called by ${callerInfo}:`,
      error
    );
    throw error;
  }
};
