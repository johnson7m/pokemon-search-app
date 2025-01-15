// src/utils/cache.js
import { getDB } from './db';

// Fetch Pokémon data from cache
export const getPokemonFromCache = async (id) => {
  const db = await getDB();
  const tx = db.transaction('pokemon', 'readonly');
  const store = tx.objectStore('pokemon');
  const data = await store.get(id);
  await tx.done;
  return data;
};

// Save Pokémon data to cache
export const savePokemonToCache = async (pokemonData) => {
  const db = await getDB();
  const tx = db.transaction('pokemon', 'readwrite');
  const store = tx.objectStore('pokemon');
  await store.put({
    ...pokemonData,
    cachedAt: Date.now(),
    }); // 'put' will add or update
  await tx.done;
};

// Check if Pokémon data exists in cache
export const isPokemonInCache = async (id) => {
  const data = await getPokemonFromCache(id);
  return !!data;
};

// Delete specific Pokémon data from cache
export const deletePokemonFromCache = async (id) => {
    const db = await getDB();
    const tx = db.transaction('pokemon', 'readwrite');
    const store = tx.objectStore('pokemon');
    await store.delete(id);
    await tx.done;
  };
  

// Optionally, implement cache invalidation (e.g., based on timestamp)
export const clearPokemonCache = async () => {
  const db = await getDB();
  const tx = db.transaction('pokemon', 'readwrite');
  const store = tx.objectStore('pokemon');
  await store.clear();
  await tx.done;
};
