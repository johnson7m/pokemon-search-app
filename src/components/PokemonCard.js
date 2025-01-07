// src/components/PokemonCard.js
import React, { useContext } from 'react';
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';

const PokemonCard = ({ pokemon }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleViewProfile = () => {
    navigate(`/pokemon/${pokemon.id}`, { state: { pokemon } });
  };

  return (
    <Card data-bs-theme={theme === 'light' ? 'light' : 'dark'} className="flex-row">
      <Card.Img
        variant="top"
        src={pokemon.sprites.front_default}
        alt={pokemon.name}
        style={{ width: '100px' }}
      />
      <Card.Body>
        <Card.Title>{pokemon.name}</Card.Title>
        <Card.Text>
          <strong>ID:</strong> {pokemon.id}
        </Card.Text>
        <Card.Text>
          <strong>Types:</strong> {pokemon.types.map(typeInfo => typeInfo.type.name).join(', ')}
        </Card.Text>
        <Button variant="primary" onClick={handleViewProfile}>
          View Profile
        </Button>
      </Card.Body>
    </Card>
  );
};

export default PokemonCard;
