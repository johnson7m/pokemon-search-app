// src/pages/Home.js
import React, { useContext, useEffect, useState } from 'react';
import { Container, Spinner, Row, Col, Alert, Button } from 'react-bootstrap';
import { ThemeContext } from '../contexts/ThemeContext';
import { useAuthContext } from '../contexts/AuthContext';
import { usePokemonContext } from '../contexts/PokemonContext';
import { getFavoritePokemon, getSearchHistory } from '../services/firestoreService';
import axios from 'axios';
import NewsSection from '../components/NewsSection';
import { getRecommendedPokemon } from '../services/recommendationService';
import PokemonCarousel from '../components/PokemonCarousel';
import FeaturedPokemon from '../components/FeaturedPokemon';
import { motion } from 'framer-motion';
import { usePageContext } from '../contexts/PageContext';
import { getPokemonFromCache, savePokemonToCache, deletePokemonFromCache } from '../utils/cache';

const variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const Home = () => {
  const { theme } = useContext(ThemeContext);
  const { user, loading: authLoading } = useAuthContext();
  const { setFeaturedPokemon } = usePokemonContext();
  const { pageState } = usePageContext();

  const [favorites, setFavorites] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [recommendedPokemon, setRecommendedPokemon] = useState([]);
  const [featuredPokemon, setLocalFeaturedPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true); // Centralized loading state
  const [error, setError] = useState(null);
  const [fetchTrigger, setFetchTrigger] = useState(0); // For retry mechanism

  // Function to fetch Featured Pokémon using IndexedDB
  const fetchFeaturedPokemon = async () => {
    // Select a random Pokémon ID
    const randomId = Math.floor(Math.random() * 898) + 1;

    try {
      // Attempt to retrieve Pokémon data from IndexedDB
      const cachedData = await getPokemonFromCache(randomId);

      if (cachedData) {
        // Validate cached data structure
        if (
          cachedData.pokemonData &&
          cachedData.pokemonData.sprites &&
          cachedData.speciesData
        ) {
          setLocalFeaturedPokemon(cachedData.pokemonData);
          setSpecies(cachedData.speciesData);
          setFeaturedPokemon(cachedData.pokemonData);
          console.log(`Home: Loaded Pokémon ID ${randomId} from cache.`);
        } else {
          // If cached data is invalid, delete it and refetch
          await deletePokemonFromCache(randomId);
          console.warn(`Home: Cached data for Pokémon ID ${randomId} is invalid. Deleted from cache.`);
          await fetchFromAPI(randomId);
        }
      } else {
        // If not in cache, fetch from API
        await fetchFromAPI(randomId);
      }
    } catch (err) {
      console.error('Home: Error fetching Featured Pokémon:', err);
      setError('Failed to load featured Pokémon. Please try again.');
    }
  };

  // Function to fetch Pokémon data from the API and cache it
  const fetchFromAPI = async (id) => {
    try {
      console.log(`Home: Fetching Pokémon ID ${id} from API.`);
      const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const pokemonData = pokemonResponse.data;

      // Fetch species data
      const speciesResponse = await axios.get(pokemonData.species.url);
      const speciesData = speciesResponse.data;

      // Update state with fetched data
      setLocalFeaturedPokemon(pokemonData);
      setSpecies(speciesData);
      setFeaturedPokemon(pokemonData);

      // Save fetched data to IndexedDB for future use
      await savePokemonToCache({
        id: pokemonData.id,
        name: pokemonData.name,
        sprites: pokemonData.sprites,
        types: pokemonData.types,
        height: pokemonData.height,
        weight: pokemonData.weight,
        stats: pokemonData.stats,
        speciesData: speciesData, // Include species data as a separate field
        cachedAt: Date.now(), // Timestamp for cache management
      });
      console.log(`Home: Cached Pokémon ID ${id} in IndexedDB.`);
    } catch (apiError) {
      console.error(`Home: Error fetching Pokémon ID ${id} from API:`, apiError);
      setError('Failed to load featured Pokémon. Please try again.');
    }
  };

  // Fetch user data: favorites and search history
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const [favs, history] = await Promise.all([
            getFavoritePokemon(),
            getSearchHistory(),
          ]);
          setFavorites(favs);
          setSearchHistory(history);
        } catch (err) {
          console.error('Home: Error fetching user data:', err);
          setError('Failed to load user data.');
        }
      }
    };
    fetchUserData();
  }, [user]);

  // Fetch recommended Pokémon based on favorites
  useEffect(() => {
    const fetchRecommended = async () => {
      if (user && favorites.length > 0) {
        try {
          const recommendations = await getRecommendedPokemon(favorites);
          setRecommendedPokemon(recommendations);
        } catch (err) {
          console.error('Home: Error fetching recommended Pokémon:', err);
          setError('Failed to load recommended Pokémon.');
        }
      }
    };
    fetchRecommended();
  }, [user, favorites]);

  // Fetch featured Pokémon
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        await fetchFeaturedPokemon();
      } else {
        // If no user, you might still want to show a featured Pokémon
        await fetchFeaturedPokemon();
      }
    };
    fetchData();
  }, [user, fetchTrigger]); // Added fetchTrigger to refetch on retry

  // Monitor all data fetching to update isDataLoading
  useEffect(() => {
    const checkLoading = () => {
      if (authLoading) return;
      // Here, adjust conditions based on what data needs to be loaded
      if (user) {
        if (favorites.length === 0 && searchHistory.length === 0) return;
        if (recommendedPokemon.length === 0 && favorites.length > 0) return;
      }
      if (!featuredPokemon) return;
      if (!species) return;
      setIsDataLoading(false);
    };
    checkLoading();
  }, [authLoading, user, recommendedPokemon, favorites, featuredPokemon, species, searchHistory]);

  // Render loading state
  if (authLoading || isDataLoading) {
    return (
      <Container className={`home-content ${theme} mt-5 text-center`}>
        <Spinner animation='border' variant={theme === 'light' ? 'dark' : 'light'} />
        <p>Loading Home...</p>
        {/* Optional: Add skeleton loaders here for better UX */}
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container className={`home-content ${theme} mt-5 text-center`}>
        <Alert variant="danger">
          {error}
        </Alert>
        <Button
          variant="primary"
          onClick={() => {
            setError(null);
            setIsDataLoading(true);
            setFetchTrigger(prev => prev + 1); // Trigger re-fetch
          }}
        >
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container className={`home-content ${theme} mt-5`}>
      {user ? (
        <h1>Welcome back, {user.displayName ? user.displayName : 'Trainer'}!</h1>
      ) : (
        <h1>Welcome to the Pokémon Search Index</h1>
      )}

      <motion.div
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3 }}
      >
        {/* Recommended Pokémon Section */}
        {user && (
          <section className="mt-5">
            <h2>Recommended for You</h2>
            {recommendedPokemon.length > 0 ? (
              <PokemonCarousel pokemonList={recommendedPokemon} theme={theme} />
            ) : (
              <p>You have no recommendations</p>
            )}
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
        <FeaturedPokemon
          section="homeFeaturedPokemon"
          // Assuming FeaturedPokemon component now handles its own data via IndexedDB
        />

        {/* Placeholder for Popular Pokémon */}
        <section className="mt-5">
          <h2>Popular Pokémon</h2>
          <p>Coming soon!</p>
        </section>

        <NewsSection />
      </motion.div>
    </Container>
  );
};

export default Home;
