// src/utils/firestoreWrapper.js
import { rateLimit } from './rateLimiter';
import { logFirestoreRequest } from './firestoreLogger';
import { getCachedFirestoreData, setCachedFirestoreData } from './firestoreCache';

/**
 * Executes a Firestore operation with logging, rate limiting, and optional caching.
 *
 * For read operations (getDocs/getDoc) the result is rate limited and cached.
 * For write operations (addDoc, updateDoc, setDoc, deleteDoc) these behaviors are bypassed
 * to ensure that every write is executed immediately.
 *
 * @param {string} operation - Firestore operation (e.g., 'getDocs', 'addDoc').
 * @param {string} key - A unique key for rate limiting (and caching) this call.
 * @param {string} context - Caller context (e.g., the service or function name).
 * @param {object} options - Optional settings:
 *    - useCache (boolean): if true, check and store the result in cache (for reads only).
 *    - transformResult (function): a function to convert the raw result into plain data.
 * @param  {...any} args - Arguments for the Firestore operation.
 * @returns {Promise<any>}
 */
export const firestoreOperation = async (operation, key, context, options = {}, ...args) => {
  const { useCache = false, transformResult } = options;
  
  // For read operations, use caching and rate limiting.
  if (operation === 'getDocs' || operation === 'getDoc') {
    if (useCache) {
      const cachedData = await getCachedFirestoreData(key);
      if (cachedData !== null) {
        console.log(`Returning cached result for ${key}`);
        return cachedData;
      }
    }
    const result = await rateLimit(async () => {
      return await logFirestoreRequest(operation, context, ...args);
    }, key);
    let finalResult = result;
    if (transformResult && typeof transformResult === 'function') {
      finalResult = transformResult(result);
    }
    if (useCache) {
      await setCachedFirestoreData(key, finalResult);
    }
    return finalResult;
  } else {
    // For write operations, bypass rate limiting and caching.
    return await logFirestoreRequest(operation, context, ...args);
  }
};
