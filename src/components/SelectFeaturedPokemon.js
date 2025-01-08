// src/components/SelectFeaturedPokemon.js
import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { getFavoritePokemon, updateUserStatistics } from '../services/firestoreService';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import { useAuthContext } from '../contexts/AuthContext';

const SelectFeaturedPokemon = () => {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (user) {
        const favs = await getFavoritePokemon();
        setFavorites(favs);
      }
    };

    fetchFavorites();
  }, [user]);

  const handleSelect = async (pokemon) => {
    if (user) {
      await updateUserStatistics(user.uid, {
        featuredPokemon: {
          id: pokemon.id,
          name: pokemon.name,
          sprite: pokemon.sprites.front_default,
        },
      });
      navigate('/profile');
    }
  };

  return (
    <Container className="mt-5">
      <h2>Select Your Featured Pokémon</h2>
      {favorites.length > 0 ? (
        <div className="d-flex flex-wrap">
          {favorites.map((pokemon) => (
            <Card
              key={pokemon.id}
              className="m-2"
              data-bs-theme={theme === 'light' ? 'light' : 'dark'}
              style={{ width: '120px' }}
            >
              <Card.Img
                variant="top"
                src={pokemon.sprites.front_default}
                alt={pokemon.name}
              />
              <Card.Body className="p-2">
                <p className="text-center text-capitalize mb-1">{pokemon.name}</p>
                <Button
                  variant={theme === 'light' ? 'dark' : 'light'}
                  size="sm"
                  onClick={() => handleSelect(pokemon)}
                >
                  Select
                </Button>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <p>You have no favorite Pokémon to select from.</p>
      )}
    </Container>
  );
};

export default SelectFeaturedPokemon;
