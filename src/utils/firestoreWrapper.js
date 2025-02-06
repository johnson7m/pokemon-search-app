import { rateLimit } from './rateLimiter';
import { logFirestoreRequest } from './firestoreLogger';
import { getCachedFirestoreData, setCachedFirestoreData } from './firestoreCache';

/**
 * Executes a Firestore operation with logging, rate limiting, and optional caching.
 *
 * @param {string} operation - Firestore operation (e.g., 'getDocs', 'addDoc').
 * @param {string} key - A unique key for rate limiting (and caching) this call.
 * @param {string} context - Caller context (e.g., the service or function name).
 * @param {object} options - Optional settings:
 *    - useCache (boolean): if true, check and store the result in cache.
 *    - transformResult (function): a function to convert the raw result into plain data.
 * @param  {...any} args - Arguments for the Firestore operation.
 * @returns {Promise<any>}
 */
export const firestoreOperation = async (operation, key, context, options = {}, ...args) => {
  const { useCache = false, transformResult } = options;
  if ((operation === 'getDocs' || operation === 'getDoc') && useCache) {
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
  if ((operation === 'getDocs' || operation === 'getDoc') && useCache) {
    await setCachedFirestoreData(key, finalResult);
  }
  return finalResult;
};
