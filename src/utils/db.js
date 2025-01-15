// src/utils/db.js
import { openDB } from 'idb';

// Initialize the IndexedDB database
const initDB = async () => {
  const db = await openDB('PokemonDB', 1, {
    upgrade(db) {
      // Create a store for Pokémon data with 'id' as the key
      if (!db.objectStoreNames.contains('pokemon')) {
        const store = db.createObjectStore('pokemon', { keyPath: 'id' });
        store.createIndex('name', 'name', { unique: false });
      }

      // You can create additional stores as needed
      // e.g., 'species', 'news', etc.
    },
  });
  return db;
};

// Get the database instance
export const getDB = (() => {
  let dbPromise = null;
  return () => {
    if (!dbPromise) {
      dbPromise = initDB();
    }
    return dbPromise;
  };
})();
