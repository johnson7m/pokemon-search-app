// src/components/PokemonList.js
import React from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PokemonList = ({ pokemons }) => {
  const navigate = useNavigate();

  const handlePokemonClick = async (pokemonUrl) => {
    if (!pokemonUrl) {
      console.error('Invalid Pokemon URL');
      return;
    }

    try {
      // Fetch the full Pokemon data
      const response = await axios.get(pokemonUrl);
      const pokemonData = response.data;
      navigate(`/pokemon/${pokemonData.id}`, { state: { pokemon: pokemonData } });
    } catch (error) {
      console.error('Error fetching Pokemon data:', error);
    }
  };

  if (!pokemons || pokemons.length === 0) {
    return <p>No Pokemon found</p>;
  }

  return (
    <ListGroup>
      {pokemons.map((pokemon, index) => (
        <ListGroupItem
          key={index}
          onClick={() => handlePokemonClick(pokemon.url)} // Pass the Pokemon URL
          style={{ cursor: 'pointer' }}
        >
          {pokemon.name}
        </ListGroupItem>
      ))}
    </ListGroup>
  );
};

export default PokemonList;
