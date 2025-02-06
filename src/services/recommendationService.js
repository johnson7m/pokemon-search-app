// src/services/recommendationService.js
import axios from 'axios';

export const getRecommendedPokemon = async (favorites) => {
  try {
    if (favorites.length === 0) return [];
    const favoriteTypes = favorites[0].types.map((type) => type);
    const response = await axios.get(`https://pokeapi.co/api/v2/type/${favoriteTypes[0]}`);
    const pokemonList = response.data.pokemon.slice(0, 8).map((p) => p.pokemon);
    const detailedPokemons = await Promise.all(
      pokemonList.map(async (pokemon) => {
        const res = await axios.get(pokemon.url);
        return res.data;
      })
    );
    return detailedPokemons;
  } catch (error) {
    console.error('Error fetching recommended Pokémon:', error);
    return [];
  }
};
