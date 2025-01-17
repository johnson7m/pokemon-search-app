// src/utils/db.js
import { openDB } from 'idb';

// Get the database instance
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
    }
  })();
  