// src/pages/MainHomePage.js
import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { auth } from '../firebase';
import { getFavoritePokemon, getSearchHistory } from '../services/firestoreService';
import { Container, Card, Button, Row, Col, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './MainHomePage.css';
import axios from 'axios';
import NewsSection from '../components/NewsSection';
import { getRecommendedPokemon } from '../services/recommendationService';
import PokemonCarousel from '../components/PokemonCarousel';
import SearchBar from '../components/SearchBar';

const MainHomePage = () => {
  const { theme } = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [featuredPokemon, setFeaturedPokemon] = useState(null);
  const [recommendedPokemon, setRecommendedPokemon] = useState([]);
  const [species, setSpecies] = useState(null);

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
      
      <div className="mt-4">
        <SearchBar />

      </div>

      {user && recommendedPokemon.length > 0 && (
        <section className="mt-5">
          <h2>Recommended for You</h2>
          <PokemonCarousel pokemonList={recommendedPokemon} theme={theme} />
        </section>
      )}

      {user && (
        <>
          <section className="mt-5">
            <h2>Your Favorites</h2>
            {favorites.length > 0 ? (
              <PokemonCarousel pokemonList={favorites} theme={theme} />
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
          <Card data-bs-theme={theme === 'light' ? 'light' : 'dark'} className="mb-3 featured-pokemon">
            <Card.Body>
              <Row className="align-items-center">
                <Col xs={12} md={4} className="text-center mb-3">
                  <Card.Img
                    src={featuredPokemon.sprites.other['official-artwork'].front_default || featuredPokemon.sprites.front_default}
                    alt={featuredPokemon.name}
                    className="img-fluid"
                    style={{ maxWidth: '250px' }}
                  />
                </Col>
                <Col xs={12} md={8}>
                  <Card.Title as="h3" className="text-capitalize">
                    {featuredPokemon.name}
                  </Card.Title>
                  <Card.Text>
                    <strong>ID:</strong> {featuredPokemon.id}
                  </Card.Text>
                  <Card.Text>
                    <strong>Type:</strong>{' '}
                    {featuredPokemon.types.map((type) => type.type.name).join(', ')}
                  </Card.Text>
                  <Card.Text>
                    <strong>Height:</strong> {featuredPokemon.height}
                  </Card.Text>
                  <Card.Text>
                    <strong>Weight:</strong> {featuredPokemon.weight}
                  </Card.Text>

                  <h4>Stats</h4>
                  <Table striped bordered hover variant={theme}>
                    <tbody>
                      {featuredPokemon.stats.map((stat) => (
                        <tr key={stat.stat.name}>
                          <td className="text-capitalize">{stat.stat.name}</td>
                          <td>{stat.base_stat}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  <Button
                    as={Link}
                    to={`/pokemon/${featuredPokemon.id}`}
                    variant="secondary"
                    className="mt-3"
                  >
                    View Details
                  </Button>
                  {species && (
                    <Card.Text className='mt-3'>
                        <strong>Description</strong>{' '}
                        {species.flavor_text_entries
                        .find((entry) => entry.language.name === 'en')
                        ?.flavor_text.replace(/[\n\f]/g, ' ') || 'Description not available'}
                    </Card.Text>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ) : (
          <p>Loading featured Pokémon...</p>
        )}
      </section>

      <section className="mt-5">
        <h2>Popular Pokémon</h2>
        {/* Placeholder for now */}
        <p>Coming soon!</p>
      </section>
      <NewsSection />
    </Container>
  );
};

export default MainHomePage;


        /* <Button as={Link} to="/search" variant={theme === 'dark' ? 'light' : 'dark'} size="lg">
          Start Search
        </Button> */