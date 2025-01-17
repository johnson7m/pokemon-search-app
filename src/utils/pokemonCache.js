// src/utils/pokemonCache.js
import { getDB } from './db';
import axios from 'axios';

const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 1 day

// Decide which fields are "essential" for your app
function hasEssentialFields(pokemon) {
  // E.g. you definitely want sprites, types, stats
  if (!pokemon) return false;
  if (!pokemon.sprites) return false;
  if (!pokemon.types) return false;
  if (!pokemon.stats) return false;
  // Optionally also check if speciesData is present if you rely on that.
  return true;
}

// Validate cache freshness
const isCacheValid = (cachedAt) => cachedAt && Date.now() - cachedAt < CACHE_EXPIRY;

export const getAllPokemon = async () => {
  const db = await getDB();
  const tx = db.transaction('pokemon', 'readonly');
  const store = tx.objectStore('pokemon');

  const allPokemon = [];
  let cursor = await store.openCursor();
  while (cursor) {
    allPokemon.push(cursor.value);
    cursor = await cursor.continue();
  }

  // If the DB is empty (meaning we have zero records):
  if (allPokemon.length < 1000) {
    console.log('[getAllPokemon] Fetching full Pokémon list from API...');
    const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0')
    .catch(err => {
      console.error('Failed to fetch all Pokémon', err)
      throw err
    });
    console.log('All Pokémon data length = ', response.data.results.length);
    
    const allPokemonData = response.data.results;

    const writeTx = db.transaction('pokemon', 'readwrite');
    const writeStore = writeTx.objectStore('pokemon');
    allPokemonData.forEach((pokemon, index) => {
      writeStore.put({
        id: index + 1,
        name: pokemon.name,
        url: pokemon.url,
        cachedAt: Date.now(),    // partial data
      });
    });
    await writeTx.done;

    return allPokemonData; // partial data list
  }

  // Otherwise, we have at least partial data in IDB
  return allPokemon;
};

export const getPokemonByIdOrName = async (idOrName) => {
  const db = await getDB();
  const tx = db.transaction('pokemon', 'readonly');
  const store = tx.objectStore('pokemon');

  const isNumeric = !isNaN(idOrName);
  const key = isNumeric ? parseInt(idOrName) : idOrName.toLowerCase();
  const cachedPokemon = isNumeric
    ? await store.get(key)              // by ID
    : await store.index('name').get(key); // by name index

  // Check freshness & partial data
  if (!cachedPokemon || !isCacheValid(cachedPokemon.cachedAt) || !hasEssentialFields(cachedPokemon)) {
    // Force a fresh fetch from PokeAPI
    console.log(`[getPokemonByIdOrName] Fetching FULL Pokémon ${idOrName} from API...`);

    try {
      const response = await axios.get(
        isNumeric
          ? `https://pokeapi.co/api/v2/pokemon/${idOrName}`
          : `https://pokeapi.co/api/v2/pokemon/${idOrName.toLowerCase()}`
      );
      const fullPokemonData = response.data;

      // Optionally fetch species data too if you rely on it:
      // const speciesResponse = await axios.get(fullPokemonData.species.url);
      // const speciesData = speciesResponse.data;
      // fullPokemonData.speciesData = speciesData;

      // Cache the full data
      const writeTx = db.transaction('pokemon', 'readwrite');
      const writeStore = writeTx.objectStore('pokemon');
      await writeStore.put({
        ...fullPokemonData,
        cachedAt: Date.now(),
      });
      await writeTx.done;

      return fullPokemonData;
    } catch (err) {
      console.error(`[getPokemonByIdOrName] Error fetching full data for ${idOrName}`, err);
      return null;
    }
  }

  // We have a fresh-enough, non-partial Pokémon in IDB
  console.log(`[getPokemonByIdOrName] Using cached FULL data for ${idOrName}`, cachedPokemon);
  return cachedPokemon;
};

export const clearPokemonCache = async () => {
  const db = await getDB();
  const tx = db.transaction('pokemon', 'readwrite');
  const store = tx.objectStore('pokemon');
  await store.clear();
  await tx.done;
};

export const savePokemonToCache = async (pokemonData) => {
  // If you call this directly (like in FeaturedPokemon), also store the full object
  const db = await getDB();
  const tx = db.transaction('pokemon', 'readwrite');
  const store = tx.objectStore('pokemon');
  await store.put({ ...pokemonData, cachedAt: Date.now() });
  await tx.done;
};
