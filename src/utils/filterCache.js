// src/utils/filterCache.js
import { getDB } from './db';
import axios from 'axios';

const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 1 day

// Base endpoints only
const API_MAP = {
  type: 'https://pokeapi.co/api/v2/type',
  ability: 'https://pokeapi.co/api/v2/ability?limit=100000',
  region: 'https://pokeapi.co/api/v2/region',
};

// Validate cache freshness
const isCacheValid = (cachedAt) => cachedAt && Date.now() - cachedAt < CACHE_EXPIRY;

export const getFilterData = async (filterName) => {
  // 1) Split on slash
  let [baseKey, subKey] = filterName.split('/');
  // If there's no slash, subKey is undefined
  // If filterName = "ability/stench" => baseKey="ability", subKey="stench"

  // e.g. if filterName="types", baseKey="types" but "types" isn't in API_MAP if you used "type" in your map. 
  // So ensure you use singular "type", "ability", "region" or adjust naming accordingly.

  // If "types" is used in your code, rename in the code or map. 
  // For now, let's assume you use singular in your advanced search, e.g. "type/fire"

  const db = await getDB();
  const tx = db.transaction('filters', 'readonly');
  const store = tx.objectStore('filters');
  const cachedFilter = await store.get(filterName);

  // Return cached data if valid
  if (cachedFilter && isCacheValid(cachedFilter.cachedAt)) {
    console.log(`Loaded ${filterName} from cache.`);
    return cachedFilter.data;
  }

  // 2) Check if baseKey is in the map
  const baseUrl = API_MAP[baseKey];
  if (!baseUrl) {
    throw new Error(`No API URL found for filter: ${filterName}`);
  }

  // 3) If subKey is present, remove "?limit=100000" from baseUrl
  let apiUrl = baseUrl;
  if (subKey) {
    apiUrl = apiUrl.replace(/\?.*/, '');  
    // => "https://pokeapi.co/api/v2/ability" or "https://pokeapi.co/api/v2/type"
    apiUrl = `${apiUrl}/${subKey}`;
  }
  console.log(`Fetching ${filterName} from API => ${apiUrl}`);

  try {
    const response = await axios.get(apiUrl);

    // For "type/fire", the response data might look like { pokemon: [ { pokemon: { name, url }, slot }, ... ] }
    // For "ability/stench", data might be { pokemon: [ { is_hidden, slot, pokemon: { name, url }}, ... ] }
    // For "region/sinnoh", data might be { ... } but you might not even call getFilterData for region subendpoints.

    let raw = response.data;

    // For "type/fire", we want an array of { name, url }, so that .forEach() in your advanced search code won't break.
    // We'll handle that here:
    let finalData;

    if (baseKey === 'type' && subKey) {
      // raw = { name, id, moves, pokemon: [ { slot, pokemon: { name, url } } ] }
      finalData = raw.pokemon.map((pObj) => ({
        name: pObj.pokemon.name,
        url: pObj.pokemon.url,
      }));
    } else if (baseKey === 'ability' && subKey) {
      // raw = { name, id, effect_entries, pokemon: [ { is_hidden, slot, pokemon: { name, url } } ] }
      finalData = raw.pokemon.map((pObj) => ({
        name: pObj.pokemon.name,
        url: pObj.pokemon.url,
      }));
    } else if (baseKey === 'region' && subKey) {
      // raw = { main_generation, ... } but maybe you don't actually call getFilterData('region/kanto')
      // If you do, we can unify it, or just return raw here:
      // or return an array if your code expects .forEach
      finalData = [raw]; 
      // Might cause issues if your code expects an array of {name}. Adjust as needed.
    } else {
      // No subKey => e.g. 'type', 'ability', 'region' (full list)
      // raw may be { results: [ ... ] } or an array. We already assigned
      // "let data = response.data.results || response.data" in older code. 
      const possibleArr = raw.results || raw;
      finalData = Array.isArray(possibleArr) ? possibleArr : [possibleArr];
    }

    // 4) Cache the finalData
    const writeTx = db.transaction('filters', 'readwrite');
    const writeStore = writeTx.objectStore('filters');
    await writeStore.put({
      name: filterName,
      data: finalData,
      cachedAt: Date.now(),
    });
    await writeTx.done;

    console.log(`Cached ${filterName} successfully.`);
    return finalData;
  } catch (error) {
    console.error(`Error fetching ${filterName} from API:`, error);
    throw error;
  }
};

// Clear specific filter data...
export const clearFilterCache = async (filterName) => {
  const db = await getDB();
  const tx = db.transaction('filters', 'readwrite');
  const store = tx.objectStore('filters');
  await store.delete(filterName);
  await tx.done;
  console.log(`Cleared cache for filter: ${filterName}`);
};

// Clear all filters...
export const clearAllFiltersCache = async () => {
  const db = await getDB();
  const tx = db.transaction('filters', 'readwrite');
  const store = tx.objectStore('filters');
  await store.clear();
  await tx.done;
  console.log('Cleared all filters from cache.');
};
