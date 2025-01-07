import React from 'react';
import { ListGroup, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SearchResults = ({ pokemons }) => {
  const navigate = useNavigate();

  const handlePokemonClick = async (pokemon) => {
    try {
      // Fetch full Pokémon data using the detailed API call
      const response = await axios.get(pokemon.url);
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
        <ListGroup.Item key={index}>
          <div className="d-flex justify-content-between align-items-center">
            <span>{pokemon.name}</span>
            <Button variant="link" onClick={() => handlePokemonClick(pokemon)}>
              View Details
            </Button>
          </div>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default SearchResults;
