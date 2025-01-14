// src/pages/Home.js
import React, { useContext, useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { ThemeContext } from '../contexts/ThemeContext';
import { useAuthContext } from '../contexts/AuthContext';
import { usePokemonContext } from '../contexts/PokemonContext';
import { getFavoritePokemon, getSearchHistory } from '../services/firestoreService';
import axios from 'axios';
import NewsSection from '../components/NewsSection'
import { getRecommendedPokemon } from '../services/recommendationService';
import PokemonCarousel from '../components/PokemonCarousel';
import FeaturedPokemon from '../components/FeaturedPokemon';

const Home = () => {
  const { theme } = useContext(ThemeContext);
  const { user, loading } = useAuthContext();
  const { featuredPokemon, setFeaturedPokemon } = usePokemonContext();
  const [favorites, setFavorites] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [recommendedPokemon, setRecommendedPokemon] = useState([]);
  const [species, setSpecies] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const favs = await getFavoritePokemon();
        const history = await getSearchHistory();
        setFavorites(favs);
        setSearchHistory(history);
      }
    };
    fetchUserData();
  }, [user]);

  useEffect(() => {
    const fetchRecommendedPokemon = async () => {
      if (user) {
        const recommendations = await getRecommendedPokemon(favorites);
        setRecommendedPokemon(recommendations);
      }
    };
    fetchRecommendedPokemon();
  }, [user, favorites]);

  useEffect(() => {
    if (featuredPokemon) {
      const fetchSpeciesData = async () => {
        try {
          const response = await axios.get(featuredPokemon.species.url);
          setSpecies(response.data);
        } catch (error) {
          console.error('Error fetching species data:', error);
        }
      };
      fetchSpeciesData();
    }
  }, [featuredPokemon]);

  useEffect(() => {
    const fetchRandomPokemon = async () => {
      try {
        const randomId = Math.floor(Math.random() * 898) + 1; // Pokémon IDs from 1 to 898
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
        setFeaturedPokemon(response.data);
      } catch (error) {
        console.error('Error fetching featured Pokémon:', error);
      }
    };
    fetchRandomPokemon();
    console.log('Random pokemon selected');
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <Container className={`home-content ${theme} mt-5`}>
      {user ? (
        <h1>Welcome back, {user.displayName ? user.displayName : 'new user'}!</h1>
      ) : (
        <h1>Welcome to the Pokémon Search Index</h1>
      )}

      {/* Recommended Pokémon Section */}
      {user && recommendedPokemon.length > 0 && (
        <section className="mt-5">
          <h2>Recommended for You</h2>
          <PokemonCarousel pokemonList={recommendedPokemon} theme={theme} />
        </section>
      )}

      {/* Favorites Section */}
      {user && (
        <section className="mt-5">
          <h2>Your Favorites</h2>
          {favorites.length > 0 ? (
            <PokemonCarousel pokemonList={favorites} theme={theme} />
          ) : (
            <p>You have no favorite Pokémon yet.</p>
          )}
        </section>
      )}

      {/* Recent Searches Section */}
      {user && (
        <section className="mt-5">
          <h2>Your Recent Searches</h2>
          {searchHistory.length > 0 ? (
            <ul>
              {searchHistory.slice(0, 5).map((term, index) => (
                <li key={index}>{term}</li>
              ))}
            </ul>
          ) : (
            <p>You have no recent searches.</p>
          )}
        </section>
      )}

      {/* Featured Pokémon Section */}
      <FeaturedPokemon/>

      {/* Placeholder for Popular Pokémon */}
      <section className="mt-5">
        <h2>Popular Pokémon</h2>
        <p>Coming soon!</p>
      </section>

      <NewsSection />
    </Container>
  );
};

export default Home;
