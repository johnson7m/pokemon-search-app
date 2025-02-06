// src/utils/pokemonCache.js
import { getDB } from './db';
import axios from 'axios';

const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 1 day expiry

// Decide which fields are “essential” for your app.
// For full details you require sprites, types, and stats.
function hasEssentialFields(pokemon) {
  if (!pokemon) return false;
  if (!pokemon.sprites) return false;
  if (!pokemon.types) return false;
  if (!pokemon.stats) return false;
  return true;
}

// Validate cache freshness based on timestamp.
const isCacheValid = (cachedAt) => cachedAt && Date.now() - cachedAt < CACHE_EXPIRY;

// A module-level flag so that preload is only triggered once.
let preloadTriggered = false;

/**
 * getAllPokemon(skipPreload = false)
 * Retrieves the current list of Pokémon (partial data) from IndexedDB.
 * If the list is empty or has fewer than expected records, it fetches the list from the API,
 * stores each entry (with id, name, url, and timestamp) into the cache, and returns that list.
 *
 * The key change here is that we extract the Pokémon ID from the URL rather than using index+1.
 *
 * If skipPreload is false (default) and the cache has not been marked as preloaded, it triggers a background preload.
 */
export const getAllPokemon = async (skipPreload = false) => {
  const db = await getDB();
  const tx = db.transaction('pokemon', 'readonly');
  const store = tx.objectStore('pokemon');
  const allPokemon = [];
  let cursor = await store.openCursor();
  while (cursor) {
    allPokemon.push(cursor.value);
    cursor = await cursor.continue();
  }

  // If the DB has fewer than expected records (1304 entries), fetch the full list from the API.
  if (allPokemon.length < 1304) {
    console.log('[getAllPokemon] Partial list not complete. Fetching from API...');
    const response = await axios
      .get('https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0')
      .catch((err) => {
        console.error('Failed to fetch full Pokémon list', err);
        throw err;
      });
    console.log('Fetched partial list; total entries = ', response.data.results.length);
    
    // Instead of using index+1, extract the ID from the URL.
    const partialList = response.data.results.map((pokemon) => {
      const parts = pokemon.url.split('/').filter(Boolean); // remove empty strings
      const id = parseInt(parts[parts.length - 1], 10); // the last part is the actual id
      return {
        id,
        name: pokemon.name,
        url: pokemon.url,
        cachedAt: Date.now(), // this is only partial data
      };
    });

    // Store partial data in IndexedDB.
    const writeTx = db.transaction('pokemon', 'readwrite');
    const writeStore = writeTx.objectStore('pokemon');
    partialList.forEach((pokemon) => {
      writeStore.put(pokemon);
    });
    await writeTx.done;

    // Overwrite the allPokemon array with the partial list.
    allPokemon.length = 0;
    allPokemon.push(...partialList);
  }

  // Trigger background preloading only if not skipped and not already triggered.
  if (!skipPreload && !preloadTriggered && !localStorage.getItem('pokemonCachePreloaded')) {
    preloadTriggered = true;
    preloadAllPokemonData();
  }

  return allPokemon;
};

/**
 * getPokemonFromCache(idOrName)
 * Reads Pokémon data from IndexedDB only.
 * Returns the cached Pokémon if it exists, is fresh, and contains all essential fields.
 * Otherwise returns null.
 */
export const getPokemonFromCache = async (idOrName) => {
  const db = await getDB();
  const tx = db.transaction('pokemon', 'readonly');
  const store = tx.objectStore('pokemon');
  const isNumeric = !isNaN(idOrName);
  const key = isNumeric ? parseInt(idOrName, 10) : idOrName.toLowerCase();
  const cachedPokemon = isNumeric
    ? await store.get(key)              // lookup by numeric ID
    : await store.index('name').get(key); // lookup by name index
  if (cachedPokemon && isCacheValid(cachedPokemon.cachedAt) && hasEssentialFields(cachedPokemon)) {
    console.log(`[getPokemonFromCache] Found cached FULL data for ${idOrName}`);
    return cachedPokemon;
  }
  console.log(`[getPokemonFromCache] No valid FULL cache for ${idOrName}`);
  return null;
};

/**
 * fetchAndCachePokemonByIdOrName(idOrName)
 * Attempts to get Pokémon data from the cache (using getPokemonFromCache).
 * If not available or incomplete, fetches full data from the API,
 * stores it in IndexedDB (overwriting any previous data), and returns the full data.
 *
 * Fallback logic: if the API returns a 404 and the input is a string containing a hyphen,
 * then try to fetch the base form by using only the part before the hyphen.
 */
export const fetchAndCachePokemonByIdOrName = async (idOrName) => {
  const cached = await getPokemonFromCache(idOrName);
  if (cached) {
    return cached;
  }
  console.log(`[fetchAndCachePokemonByIdOrName] Fetching FULL Pokémon ${idOrName} from API...`);
  try {
    const isNumeric = !isNaN(idOrName);
    const url = isNumeric
      ? `https://pokeapi.co/api/v2/pokemon/${idOrName}`
      : `https://pokeapi.co/api/v2/pokemon/${idOrName.toLowerCase()}`;
    const response = await axios.get(url);
    const fullPokemonData = response.data;

    // Optionally, fetch species data if needed.
    // const speciesResponse = await axios.get(fullPokemonData.species.url);
    // fullPokemonData.speciesData = speciesResponse.data;

    const db = await getDB();
    const tx = db.transaction('pokemon', 'readwrite');
    const store = tx.objectStore('pokemon');
    await store.put({
      ...fullPokemonData,
      cachedAt: Date.now(),
    });
    await tx.done;
    return fullPokemonData;
  } catch (err) {
    if (
      err.response &&
      err.response.status === 404 &&
      typeof idOrName === 'string' &&
      idOrName.includes('-')
    ) {
      // Instead of falling back to the base form, you now want to keep the behavior that
      // variants have their own links (so that their evolution chain and variant links are preserved).
      // However, if a variant's full data isn’t available on initial load, you might need to fetch its base form,
      // and then later if the variant is requested (or if the user switches from base to variant),
      // the cached base form might help.
      //
      // One approach is to first try fetching the variant’s data; if it fails, then try the base form.
      const baseName = idOrName.split('-')[0];
      console.log(
        `[fetchAndCachePokemonByIdOrName] 404 encountered for "${idOrName}". Trying base form "${baseName}".`
      );
      return fetchAndCachePokemonByIdOrName(baseName);
    }
    console.error(`[fetchAndCachePokemonByIdOrName] Error fetching full data for ${idOrName}`, err);
    return null;
  }
};

/**
 * preloadAllPokemonData()
 * Preloads the full details for every Pokémon entry into the cache in parallel batches.
 * It obtains the partial list by calling getAllPokemon with skipPreload=true,
 * then in batches, fetches full data (via fetchAndCachePokemonByIdOrName) for every Pokémon
 * that isn’t already cached with full details.
 * Once complete, it sets a flag in localStorage so that subsequent page loads skip preloading.
 */
export const preloadAllPokemonData = async () => {
  console.log('[preloadAllPokemonData] Starting preload of all Pokémon full data...');
  try {
    const partialList = await getAllPokemon(true);
    const batchSize = 20; // adjust concurrency as needed
    for (let i = 0; i < partialList.length; i += batchSize) {
      const batch = partialList.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (p) => {
          const fullData = await fetchAndCachePokemonByIdOrName(p.id);
          if (fullData) {
            console.log(`[preloadAllPokemonData] Cached full data for ${p.name}`);
          }
          return fullData;
        })
      );
    }
    console.log('[preloadAllPokemonData] Completed preloading all Pokémon full data.');
    localStorage.setItem('pokemonCachePreloaded', 'true');
  } catch (err) {
    console.error('[preloadAllPokemonData] Error preloading Pokémon data:', err);
  }
};

/**
 * clearPokemonCache()
 * Clears the entire Pokémon cache from IndexedDB and removes the preload flag.
 */
export const clearPokemonCache = async () => {
  const db = await getDB();
  const tx = db.transaction('pokemon', 'readwrite');
  const store = tx.objectStore('pokemon');
  await store.clear();
  await tx.done;
  localStorage.removeItem('pokemonCachePreloaded');
  console.log('Cleared Pokémon cache.');
};

/**
 * savePokemonToCache(pokemonData)
 * Saves a given Pokémon data object into the cache.
 */
export const savePokemonToCache = async (pokemonData) => {
  const db = await getDB();
  const tx = db.transaction('pokemon', 'readwrite');
  const store = tx.objectStore('pokemon');
  await store.put({ ...pokemonData, cachedAt: Date.now() });
  await tx.done;
  console.log(`Saved Pokémon ${pokemonData.name} to cache.`);
};
