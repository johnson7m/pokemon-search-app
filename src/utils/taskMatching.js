// src/utils/taskMatching.js
import { getEvolutionStage } from './evolutionUtils';

/**
 * For a single "search" progress module, check if `pokemon` satisfies its searchCriteria.
 */
export async function matchesModuleCriteria(module, pokemon) {
  if (!module || !pokemon) return false;
  if (module.progressType !== 'search') return false;

  const { searchCriteria } = module; 
  // e.g. { requiredType: 'water', evolutionStagesAllowed: [2], ... }

  // 1) Check type
  if (searchCriteria?.requiredType) {
    const requiredType = searchCriteria.requiredType.toLowerCase();
    const pokemonTypes = pokemon.types.map((t) => t.type.name.toLowerCase());
    if (!pokemonTypes.includes(requiredType)) {
      return false;
    }
  }

  // 2) Check evolution stage if present
  if (searchCriteria?.evolutionStagesAllowed) {
    const stage = await getEvolutionStage(pokemon.name.toLowerCase(), {});
    if (!searchCriteria.evolutionStagesAllowed.includes(stage)) {
      return false;
    }
  }

  // 3) Possibly region checks, etc.

  return true; 
}
