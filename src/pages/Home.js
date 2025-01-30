import React, { useContext, useEffect, useState } from 'react';
import { Container, Spinner, Alert, Button } from 'react-bootstrap';
import { ThemeContext } from '../contexts/ThemeContext';
import { useAuthContext } from '../contexts/AuthContext';
import { getFavoritePokemon, getSearchHistory } from '../services/firestoreService';
import NewsSection from '../components/NewsSection';
import { getRecommendedPokemon } from '../services/recommendationService';
import PokemonCarousel from '../components/PokemonCarousel';
import FeaturedPokemon from '../components/FeaturedPokemon';
import { motion } from 'framer-motion';

const variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const Home = () => {
  const { theme } = useContext(ThemeContext);
  const { user, loading: authLoading } = useAuthContext();

  const [favorites, setFavorites] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [recommendedPokemon, setRecommendedPokemon] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isContentReady, setIsContentReady] = useState(false);
  const [error, setError] = useState(null);


    useEffect(() => {
      console.log('Home mounted');
      return () => {
        console.log('Home unmounted');
      };
    }, []);

  useEffect(() => {
    let isMounted = true; // Flag to track if component is mounted

    const fetchUserData = async () => {
      if (user) {
        try {
          const [favs, history] = await Promise.all([
            getFavoritePokemon(),
            getSearchHistory(),
          ]);
          if (isMounted) {
            setFavorites(favs);
            setSearchHistory(history);
          }
        } catch (err) {
          console.error('Home: Error fetching user data:', err);
          if (isMounted) setError('Failed to load user data.');
        }
      }
    };
    fetchUserData();

    return () => {
      isMounted = false; // Cleanup flag on unmount
    };
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const fetchRecommended = async () => {
      if (user && favorites.length > 0) {
        try {
          const recommendations = await getRecommendedPokemon(favorites);
          if (isMounted) setRecommendedPokemon(recommendations);
        } catch (err) {
          console.error('Home: Error fetching recommended Pokémon:', err);
          if (isMounted) setError('Failed to load recommended Pokémon.');
        }
      }
    };
    fetchRecommended();

    return () => {
      isMounted = false;
    };
  }, [user, favorites]);

  useEffect(() => {
    let isMounted = true;

    const checkLoading = () => {
      console.log('[checkLoading]:', {
        authLoading,
        userExists: !!user,
        favoritesLength: favorites.length,
        recommendedPokemonLength: recommendedPokemon.length,
      });

      if (authLoading) return;
      if (user) {
        if (favorites.length === 0 && searchHistory.length === 0) return;
        if (favorites.length > 0 && recommendedPokemon.length === 0) return;
      }
      if (isMounted) {
        setIsDataLoading(false);
        setIsContentReady(true);
      }
    };

    checkLoading();

    return () => {
      isMounted = false;
    };
  }, [authLoading, user, recommendedPokemon, favorites, searchHistory]);

  if (authLoading || isDataLoading) {
    return (
      <Container className={`home-content ${theme} mt-5 text-center`}>
        <Spinner animation="border" variant={theme === 'light' ? 'dark' : 'light'} />
        <p>Loading Home...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className={`home-content ${theme} mt-5 text-center`}>
        <Alert variant="danger">{error}</Alert>
        <Button
          variant="primary"
          onClick={() => {
            setError(null);
            setIsDataLoading(true);
          }}
        >
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <motion.div
     key="home"
     variants={variants}
     initial="initial"
     animate="animate"
     exit='exit'
     transition={{ duration: 0.2 }}
    >
    <Container className={`home-content ${theme} mt-5`}>


      {isContentReady && (
        <motion.div
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
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

          <FeaturedPokemon section="homeFeaturedPokemon" />

          <section className="mt-5">
            <h2>Popular Pokémon</h2>
            <p>Coming soon!</p>
          </section>

          <NewsSection />
        </motion.div>
      )}
    </Container>
    </motion.div>
  );
};

export default Home;
