// src/utils/rateLimiter.js
const requestCache = new Map();

/**
 * Limits the frequency of a function call by caching its results for a given time.
 * @param {Function} fn - The function to limit.
 * @param {string} key - A unique key to identify the request.
 * @param {number} duration - The duration in milliseconds to cache the result.
 */
export const rateLimit = async (fn, key, duration = 5000) => {
  if (requestCache.has(key)) {
    console.log(`[RateLimiter] Skipping request for key: ${key}`);
    return requestCache.get(key);
  }

  const result = await fn();
  requestCache.set(key, result);

  setTimeout(() => {
    requestCache.delete(key);
  }, duration);

  return result;
};
