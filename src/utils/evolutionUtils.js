// src/utils/evolutionUtils.js
import axios from 'axios';

/**
 * Determines the evolution stage of a given Pokémon.
 * @param {string} pokemonName - The name of the Pokémon.
 * @param {object} cache - Cache object to store evolution stages.
 * @returns {number} - Evolution stage number.
 */
export const getEvolutionStage = async (pokemonName, cache) => {
  // Check if the evolution stage is already cached
  if (cache[pokemonName] !== undefined) {
    return cache[pokemonName];
  }

  try {
    const speciesRes = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`);
    const evolutionChainUrl = speciesRes.data.evolution_chain.url;

    const evolutionRes = await axios.get(evolutionChainUrl);
    const chain = evolutionRes.data.chain;

    // Traverse the evolution chain to assign stages
    const stages = {};

    const traverse = (node, stage) => {
      stages[node.species.name] = stage;
      node.evolves_to.forEach((evo) => traverse(evo, stage + 1));
    };

    traverse(chain, 1);

    const stage = stages[pokemonName] || 1;

    // Update the cache
    cache[pokemonName] = stage;

    return stage;
  } catch (error) {
    console.error(`Error determining evolution stage for ${pokemonName}:`, error);
    return 1; // Default to stage 1 if error occurs
  }
};
