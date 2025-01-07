// src/utils/regionUtils.js
import axios from 'axios';

/**
 * Fetches Pokémon names associated with a specific region.
 * @param {string} regionName - The name of the region.
 * @returns {Array<string>} - Array of Pokémon names.
 */
export const getPokemonNamesByRegion = async (regionName) => {
  try {
    const regionRes = await axios.get(`https://pokeapi.co/api/v2/region/${regionName}`);
    const generationUrl = regionRes.data.main_generation.url;

    const generationRes = await axios.get(generationUrl);
    const pokemonSpecies = generationRes.data.pokemon_species;

    // Map species to Pokémon names
    const pokemonNames = pokemonSpecies.map((species) => species.name);
    return pokemonNames;
  } catch (error) {
    console.error('Error fetching Pokémon by region:', error);
    return [];
  }
};
