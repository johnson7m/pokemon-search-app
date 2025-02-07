// src/utils/rateLimiter.js
const requestCache = new Map();

/**
 * Limits the frequency of a function call by caching its results for a given time.
 * @param {Function} fn - The function to limit.
 * @param {string} key - A unique key to identify the request.
 * @param {number} duration - The duration in milliseconds to cache the result.
 */
export const rateLimit = async (fn, key, duration = 60000) => {
  if (requestCache.has(key)) {
    console.log(`[RateLimiter] Serving cached response for key: ${key}`);
    return requestCache.get(key);
  }

  console.log(`[RateLimiter] Executing new request for key: ${key}`);
  const result = await fn();
  requestCache.set(key, result);

  setTimeout(() => {
    requestCache.delete(key);
    console.log(`[RateLimiter] Cache expired for key: ${key}`);
  }, duration);

  return result;
};

/**
 * Clears the rate limiter cache for a specific key.
 * @param {string} key - The key to clear.
 */
export const clearRateLimiterCache = (key) => {
  if (requestCache.has(key)) {
    requestCache.delete(key);
    console.log(`[RateLimiter] Cleared cache for key: ${key}`);
  }
};
