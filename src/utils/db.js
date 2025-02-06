import { openDB } from 'idb';

export const initDB = async () => {
  const db = await openDB('pokemonDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('filters')) {
        db.createObjectStore('filters', { keyPath: 'name' });
      }
      if (!db.objectStoreNames.contains('pokemon')) {
        const store = db.createObjectStore('pokemon', { keyPath: 'id' });
        store.createIndex('name', 'name', { unique: false });
      }
      // New object store for caching Firestore results:
      if (!db.objectStoreNames.contains('firestoreCache')) {
        db.createObjectStore('firestoreCache', { keyPath: 'key' });
      }
    },
  });
  return db;
};

export const getDB = (() => {
  let dbPromise = null;
  return () => {
    if (!dbPromise) {
      dbPromise = initDB();
    }
    return dbPromise;
  };
})();
