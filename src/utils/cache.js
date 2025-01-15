import { getDB } from './db';

// Validate cached Pokémon data
const isValidPokemonCache = (data) => {
  return (
    data &&
    typeof data.id === 'number' &&
    data.sprites &&
    data.speciesData &&
    Array.isArray(data.stats)
  );
};

// Fetch Pokémon data from cache with validation
export const getPokemonFromCache = async (id) => {
  const db = await getDB();
  const tx = db.transaction('pokemon', 'readonly');
  const store = tx.objectStore('pokemon');
  const data = await store.get(id);
  await tx.done;

  return isValidPokemonCache(data) ? data : null;
};

// Save Pokémon data to cache
export const savePokemonToCache = async (pokemonData) => {
  const db = await getDB();
  const tx = db.transaction('pokemon', 'readwrite');
  const store = tx.objectStore('pokemon');
  await store.put({
    ...pokemonData,
    cachedAt: Date.now(),
  });
  await tx.done;
};

// Delete specific Pokémon data from cache
export const deletePokemonFromCache = async (id) => {
  const db = await getDB();
  const tx = db.transaction('pokemon', 'readwrite');
  const store = tx.objectStore('pokemon');
  await store.delete(id);
  await tx.done;
};

// Clear entire Pokémon cache
export const clearPokemonCache = async () => {
  const db = await getDB();
  const tx = db.transaction('pokemon', 'readwrite');
  const store = tx.objectStore('pokemon');
  await store.clear();
  await tx.done;
};
