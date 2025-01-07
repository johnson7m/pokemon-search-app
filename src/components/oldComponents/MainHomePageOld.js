// src/pages/MainHomePage.js
import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { auth } from '../firebase';
import { getFavoritePokemon, getSearchHistory } from '../services/firestoreService';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './MainHomePage.css';
import axios from 'axios';
import NewsSection from '../components/NewsSection';
import { getRecommendedPokemon } from '../services/recommendationService';
import PokemonCarousel from '../components/PokemonCarousel';


const MainHomePage = () => {
  const { theme } = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [featuredPokemon, setFeaturedPokemon] = useState(null);
  const [recommendedPokemon, setRecommendedPokemon] = useState([]);

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
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const favs = await getFavoritePokemon();
        const history = await getSearchHistory();
        setFavorites(favs);
        setSearchHistory(history);
      }
    });

    return () => unsubscribe();
  }, []);

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
  }, []);


  return (
    <Container className={`main-homepage ${theme} mt-5`}>
      {user ? (
        <h1>Welcome back, {user.displayName}!</h1>
      ) : (
        <h1>Welcome to the Pokémon Search Index</h1>
      )}
      <NewsSection />
      <div className="mt-4">
        <Button as={Link} to="/search" variant={theme === 'dark' ? 'light' : 'dark'} size='lg'>
          Start Search
        </Button>
      </div>
      {user && recommendedPokemon.length > 0 && (
      <section className="mt-5">
        <h2>Recommended for You</h2>
        <Row>
          {recommendedPokemon.map((pokemon) => (
            <Col key={pokemon.id} xs={12} sm={6} md={3}>
              <Card data-bs-theme={theme === 'light' ? 'light' : 'dark'}className="mb-3">
                <Card.Img variant="top" src={pokemon.sprites.front_default} />
                <Card.Body>
                  <Card.Title>{pokemon.name}</Card.Title>
                  <Button as={Link} to={`/pokemon/${pokemon.id}`} variant="secondary">
                    View Details
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
      )}      
      {user && (
        <>
          <section className="mt-5">
            <h2>Your Favorites</h2>
            {favorites.length > 0 ? (
              <Row>
                {favorites.slice(0, 4).map((pokemon) => (
                  <Col key={pokemon.id} xs={12} sm={6} md={3}>
                    <Card data-bs-theme={theme === 'light' ? 'light' : 'dark'} className="mb-3">
                      <Card.Img variant="top" src={pokemon.sprites.front_default} />
                      <Card.Body>
                        <Card.Title>{pokemon.name}</Card.Title>
                        <Button as={Link} to={`/pokemon/${pokemon.id}`} variant="secondary">
                          View Details
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <p>You have no favorite Pokémon yet.</p>
            )}
          </section>
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
        </>
      )}
      <section className="mt-5">
        <h2>Featured Pokémon</h2>
        {featuredPokemon ? (
          <Row className="justify-content-start">
            <Col xs={12} md={6} lg={4}>
              <Card
                data-bs-theme={theme === 'light' ? 'light' : 'dark'}
                className="mb-3"
              >
                <Card.Body>
                  <Row noGutters>
                    <Col xs={12} md={5}>
                      <Card.Img
                        src={featuredPokemon.sprites.front_default}
                        alt={featuredPokemon.name}
                        className="img-fluid"
                      />
                    </Col>
                    <Col xs={12} md={7}>
                      <Card.Title className="text-capitalize">
                        {featuredPokemon.name}
                      </Card.Title>
                      <Card.Text>
                        <strong>Type:</strong>{' '}
                        {featuredPokemon.types
                          .map((type) => type.type.name)
                          .join(', ')}
                      </Card.Text>
                      <h5>Stats:</h5>
                      <ul className="list-unstyled">
                        {featuredPokemon.stats.map((stat) => (
                          <li key={stat.stat.name} className="text-capitalize">
                            {stat.stat.name}: {stat.base_stat}
                          </li>
                        ))}
                      </ul>
                      <Button
                        as={Link}
                        to={`/pokemon/${featuredPokemon.id}`}
                        variant="secondary"
                      >
                        View Details
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : (
          <p>Loading featured Pokémon...</p>
        )}
      </section>    
      <section className="mt-5">
        <h2>Popular Pokémon</h2>
        {/* Placeholder for now */}
        <p>Coming soon!</p>
      </section>
    </Container>
  );
};

export default MainHomePage;
