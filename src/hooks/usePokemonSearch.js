// src/hooks/usePokemonSearch.js
import { useState, useCallback, useEffect } from 'react';
import { debounce } from 'lodash';
import { getFilterData } from '../utils/filterCache';
import { getAllPokemon, fetchAndCachePokemonByIdOrName} from '../utils/pokemonCache';
import { saveSearchHistory } from '../services/firestoreService';
import axios from 'axios';

/**
 * Helper to fetch Pokémon by region name (like "kanto").
 */
async function getPokemonNamesByRegion(regionName) {
  try {
    const regionRes = await axios.get(`https://pokeapi.co/api/v2/region/${regionName}`);
    const generationUrl = regionRes.data.main_generation.url;
    const generationRes = await axios.get(generationUrl);
    const pokemonSpecies = generationRes.data.pokemon_species;
    return pokemonSpecies.map((species) => species.name);
  } catch (error) {
    console.error('[usePokemonSearch] Error fetching Pokémon by region:', error);
    throw error;
  }
}

/**
 * Helper to fetch evolution stage, like 1=Base, 2=First Evo, 3=Second Evo.
 */

// Expand skip list
const skipKeywords = [
    'mega',
    'incarnate',
    'therian',
    'gmax',
    'alola',
    'galar',
    'hisui',
    'totem',
    'amped',
    'low-key',
    'crowned', // e.g. "zacian-crowned"
    'eternamax',
    // add more as you see 404 for them
  ];

  async function getEvolutionStage(pokemonName, evolutionStageCache, setEvolutionStageCache, includeAlters) {
    // 1) Already cached
    if (pokemonName in evolutionStageCache) {
      return evolutionStageCache[pokemonName];
    }
  
  // Only skip if user did NOT want variants
  if (!includeAlters) {
    const lower = pokemonName.toLowerCase();
    for (const kw of skipKeywords) {
      if (lower.includes(kw)) {
        console.warn(`[getEvolutionStage] Skipping special form: ${pokemonName}`);
        setEvolutionStageCache((prev) => ({ ...prev, [pokemonName]: null }));
        return null;
      }
    }
  }

  
    // 3) Attempt normal fetch
    try {
      const speciesRes = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`);
      const evolutionChainUrl = speciesRes.data.evolution_chain.url;
      const evolutionRes = await axios.get(evolutionChainUrl);
  
      const chain = evolutionRes.data.chain;
      const stages = {};
      const traverse = (node, stage) => {
        stages[node.species.name] = stage;
        node.evolves_to.forEach((evo) => traverse(evo, stage + 1));
      };
      traverse(chain, 1);
  
      const finalStage = stages[pokemonName] || 1;
      setEvolutionStageCache((prev) => ({ ...prev, [pokemonName]: finalStage }));
      return finalStage;
    } catch (error) {
      console.error(`[getEvolutionStage] 404 or error for ${pokemonName}:`, error);
      setEvolutionStageCache((prev) => ({ ...prev, [pokemonName]: 1 }));
      return 1;
    }
  }
  

export function usePokemonSearch(xpTrigger) {
  // Basic search
  const [allPokemonList, setAllPokemonList] = useState([]);
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Advanced search data
  const [types, setTypes] = useState([]);
  const [abilitiesList, setAbilitiesList] = useState([]);
  const [regions, setRegions] = useState([]);
  // Results
  const [filteredPokemonNames, setFilteredPokemonNames] = useState([]);
  const [filteredSearchResults, setFilteredSearchResults] = useState([]);
  const [hasMoreResults, setHasMoreResults] = useState(true);
  const [offset, setOffset] = useState(0);

  // Local cache for evolution stages
  const [evolutionStageCache, setEvolutionStageCache] = useState({});

  // 1) On mount, fetch "type", "ability", "region", plus the partial "allPokemonList" from IDB
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesData, abilitiesData, regionsData, allPokemonData] = await Promise.all([
          getFilterData('type'),
          getFilterData('ability'),
          getFilterData('region'),
          getAllPokemon(),
        ]);

        setTypes(typesData);
        setAbilitiesList(abilitiesData);
        setRegions(regionsData);
        setAllPokemonList(allPokemonData); // partial data, but enough for name-based filtering
      } catch (error) {
        console.error('[usePokemonSearch] Error fetching data:', error);
        setErrorMessage('Failed to load search options. Please try again later.');
      }
    };
    fetchData();
  }, []);

  /**
   * Debounced live search for top bar
   */
  const liveSearch = useCallback(
    debounce(async (inputValue) => {
      if (!inputValue.trim()) {
        setAutocompleteResults([]);
        return;
      }
      const results = [];
      const isNumeric = !isNaN(inputValue);

      try {
        if (isNumeric) {
          const pokemonById = await fetchAndCachePokemonByIdOrName(inputValue);
          if (pokemonById) {
            results.push({ 
                name: pokemonById.name, 
                url: pokemonById.species?.url 
            });
          }
        } else {
          // Filter from partial allPokemonList
          const filtered = allPokemonList.filter((p) =>
            p.name.toLowerCase().includes(inputValue.toLowerCase())
          );
          results.push(...filtered.slice(0, 10));
        }
        setAutocompleteResults(results);
      } catch (error) {
        console.error('[usePokemonSearch] Error during live search:', error);
      }
    }, 50),
    [allPokemonList]
  );

  const handleInputChange = (value) => {
    setSearchTerm(value);
    liveSearch(value);
  };

  const handleSelectAutocomplete = async (pokemon) => {
    try {
      if (!pokemon?.name) return;
      const selectedPokemon = await fetchAndCachePokemonByIdOrName(pokemon.name);
      if (!selectedPokemon) {
        setErrorMessage(`No Pokémon data found for "${pokemon.name}".`);
        return null;
      }
      await saveSearchHistory(selectedPokemon.name, xpTrigger);

      setAutocompleteResults([]);
      return selectedPokemon;
    } catch (error) {
      console.error('[usePokemonSearch] Error fetching Pokémon details:', error);
      setErrorMessage('Failed to load Pokémon details.');
    }
  };

  /**
   * Combined advanced search:
   * 1) type => getFilterData('type/fire') => array of {name, url}
   * 2) ability => getFilterData('ability/stench') => array of {name, url}
   * 3) region => getPokemonNamesByRegion('kanto') => array of names
   * 4) evolution => we call getEvolutionStage on each name
   * 5) intersect them all
   */
  const handleAdvancedSearch = async ({
    selectedType,
    selectedAbility,
    selectedRegion,
    selectedEvolutionStage,
    includeAlters,
  }) => {
    setIsLoading(true);
    setFilteredSearchResults([]);
    setOffset(0);
    setHasMoreResults(true);
    setErrorMessage('');

    let searchSet = new Set(); // We'll fill this with matching names

    try {
      // TYPE
      if (selectedType) {
        const typeData = await getFilterData(`type/${selectedType}`);
        // typeData => array of {name, url}
        typeData.forEach((p) => searchSet.add(p.name));
      }

      // ABILITY
      if (selectedAbility) {
        const abilityData = await getFilterData(`ability/${selectedAbility}`);
        if (searchSet.size > 0) {
          // intersect with the existing set
          const abilityNames = abilityData.map((p) => p.name);
          searchSet = new Set([...searchSet].filter((name) => abilityNames.includes(name)));
        } else {
          // no type selected yet, so fill from ability
          abilityData.forEach((p) => searchSet.add(p.name));
        }
      }

      // REGION
      if (selectedRegion) {
        const regionNames = await getPokemonNamesByRegion(selectedRegion);
        if (searchSet.size > 0) {
          // intersect
          searchSet = new Set([...searchSet].filter((name) => regionNames.includes(name)));
        } else {
          // fill if empty
          regionNames.forEach((n) => searchSet.add(n));
        }
      }

      // EVOLUTION STAGE
      if (selectedEvolutionStage) {
        const stageNum = parseInt(selectedEvolutionStage, 10);
        let namesArray;
        if (searchSet.size === 0) {
          namesArray = allPokemonList.map((p) => p.name);
        } else {
          namesArray = Array.from(searchSet);
        }
      
        // optional: limit concurrency or do Promise.all
        const stagePromises = namesArray.map((name) =>
          getEvolutionStage(name, evolutionStageCache, setEvolutionStageCache, includeAlters)
        );
        const results = await Promise.all(stagePromises); 
        // now filter
        const stageResults = [];
        for (let i = 0; i < namesArray.length; i++) {
          if (results[i] === stageNum) {
            stageResults.push(namesArray[i]);
          }
        }
        searchSet = new Set(stageResults);
      }

      // EXCLUDE VARIANTS (e.g. if name includes '-')
      if (!includeAlters) {
        searchSet = new Set([...searchSet].filter((name) => !name.includes('-')));
      }

      // If user picked no filters at all, searchSet might still be empty => all results
      // but typically you want "no results" or "did you pick any filter?" logic
      if (searchSet.size === 0) {
        setFilteredPokemonNames([]);
        setFilteredSearchResults([]);
        setHasMoreResults(false);
        setErrorMessage('No Pokémon found matching the selected criteria.');
        setIsLoading(false);
        return;
      }

      // Convert to array, fetch details
      const allFilteredNames = Array.from(searchSet);
      setFilteredPokemonNames(allFilteredNames);

      // Fetch first batch
      await fetchFilteredPokemon(allFilteredNames, 0);

      // Optionally log or store the user’s search
      const searchDesc = `Type: ${selectedType || 'Any'}, Ability: ${selectedAbility || 'Any'}, Stage: ${
        selectedEvolutionStage || 'Any'
      }, Region: ${selectedRegion || 'Any'}`;
      saveSearchHistory(searchDesc, xpTrigger);
    } catch (err) {
      console.error('[usePokemonSearch] Error during advanced search:', err);
      setErrorMessage('Failed to fetch filtered Pokémon.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * "Load More" pagination
   */
  const fetchFilteredPokemon = async (pokemonNames, currentOffset) => {
    setIsLoading(true);
    const nextBatch = pokemonNames.slice(currentOffset, currentOffset + 8);
    console.log('[AdvancedSearch] fetchFilteredPokemon => nextBatch:', nextBatch);

    try {
        const detailedResults = await Promise.all(
            nextBatch.map(async (name) => {
              try {
                const data = await fetchAndCachePokemonByIdOrName(name);
                console.log(`[AdvancedSearch] fetchAndCachePokemonByIdOrName("${name}") =>`, data);
                return data; // or null
              } catch (err) {
                console.error(`[AdvancedSearch] Error fetching Pokémon "${name}"`, err);
                return null;
              }
            })
          );

      console.log('[AdvancedSearch] detailedResults =>', detailedResults);
      const valid = detailedResults.filter(Boolean);
      setFilteredSearchResults((prev) => [...prev, ...valid]);
      setOffset(currentOffset + 8);
      if (currentOffset + 8 >= pokemonNames.length) {
        setHasMoreResults(false);
      }
    } catch (err) {
      console.error('[AdvancedSearch] Error fetching next batch of Pokémon:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Basic search data
    searchTerm,
    autocompleteResults,
    isLoading,
    errorMessage,
    // Filter data
    types,
    abilitiesList,
    regions,
    // Results
    filteredPokemonNames,
    filteredSearchResults,
    hasMoreResults,
    offset,
    // Handlers
    handleInputChange,
    handleSelectAutocomplete,
    handleAdvancedSearch,
    fetchFilteredPokemon,
    setErrorMessage,
  };
}
