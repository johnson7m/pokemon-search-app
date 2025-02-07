// src/utils/firestoreCache.js
import { getDB } from './db';
import { clearRateLimiterCache } from './rateLimiter';

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes TTL

export const getCachedFirestoreData = async (key) => {
  const db = await getDB();
  const tx = db.transaction('firestoreCache', 'readonly');
  const store = tx.objectStore('firestoreCache');
  const cached = await store.get(key);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
    console.log(`Loaded ${key} from Firestore cache.`);
    return cached.data;
  }
  return null;
};

export const setCachedFirestoreData = async (key, data) => {
  const db = await getDB();
  const tx = db.transaction('firestoreCache', 'readwrite');
  const store = tx.objectStore('firestoreCache');
  await store.put({
    key,
    data,
    cachedAt: Date.now(),
  });
  await tx.done;
  console.log(`Cached ${key} in Firestore cache.`);
};

export const clearCachedFirestoreData = async (key) => {
  const db = await getDB();
  const tx = db.transaction('firestoreCache', 'readwrite');
  const store = tx.objectStore('firestoreCache');
  await store.delete(key);
  await tx.done;
  console.log(`Cleared cache for ${key} from IndexedDB.`);
  // ALSO clear the in-memory (rate limiter) cache
  clearRateLimiterCache(key);
};
