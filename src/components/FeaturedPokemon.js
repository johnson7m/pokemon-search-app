// src/components/FeaturedPokemon.js
import React, { useContext, useEffect, useState, useRef } from 'react';
import { Container, Card, Button, Row, Col, Table, Spinner } from 'react-bootstrap';
import { ThemeContext } from '../contexts/ThemeContext';
import { usePokemonContext } from '../contexts/PokemonContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import './FeaturedPokemon.css'; // Custom CSS
import { savePokemonToCache, getPokemonByIdOrName } from '../utils/pokemonCache';

const variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const FeaturedPokemon = () => {
  const { theme } = useContext(ThemeContext);
  const { featuredPokemon, setFeaturedPokemon } = usePokemonContext();
  const [species, setSpecies] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isContentReady, setIsContentReady] = useState(false);
  const [error, setError] = useState(null);

  const isFetchingRef = useRef(false);

  useEffect(() => {
    const fetchPokemonAndSpecies = async () => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      setIsLoading(true);
      setIsContentReady(false);
      setError(null);

      const randomId = Math.floor(Math.random() * 898) + 1;
      try {
        const cachedData = await getPokemonByIdOrName(randomId);
        if (cachedData) {
          setFeaturedPokemon(cachedData);
          setSpecies(cachedData.speciesData);
          console.log(`FeaturedPokemon: Loaded Pokémon ID ${randomId} from cache.`);
        } else {
          console.log(`FeaturedPokemon: No valid cache for Pokémon ID ${randomId}, fetching from API.`);
          await fetchFromAPI(randomId);
        }
      } catch (err) {
        console.error('Error fetching Pokémon or species data:', err);
        setError('Failed to load featured Pokémon. Please try again.');
      } finally {
        setIsLoading(false);
        setIsContentReady(true);
        isFetchingRef.current = false;
      }
    };

    const fetchFromAPI = async (id) => {
      try {
        console.log(`FeaturedPokemon: Fetching Pokémon ID ${id} from API.`);
        const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const pokemonData = pokemonResponse.data;

        const speciesResponse = await axios.get(pokemonData.species.url);
        const speciesData = speciesResponse.data;

        setFeaturedPokemon(pokemonData);
        setSpecies(speciesData);

        await savePokemonToCache({
          id: pokemonData.id,
          name: pokemonData.name,
          sprites: pokemonData.sprites,
          types: pokemonData.types,
          height: pokemonData.height,
          weight: pokemonData.weight,
          stats: pokemonData.stats,
          speciesData,
        });
        console.log(`FeaturedPokemon: Cached Pokémon ID ${id} in IndexedDB.`);
      } catch (apiError) {
        console.error(`Error fetching Pokémon ID ${id} from API:`, apiError);
        setError('Failed to load featured Pokémon. Please try again.');
      }
    };

    fetchPokemonAndSpecies();
  }, [setFeaturedPokemon]);

  // Loading
  if (isLoading) {
    return (
      <Container>
        <section className="mt-5">
          <div className="text-center mt-4">
            <Spinner animation="border" variant={theme === 'light' ? 'dark' : 'light'} />
            <p>Loading featured Pokémon...</p>
          </div>
        </section>
      </Container>
    );
  }

  // Error
  if (error) {
    return (
      <Container>
        <section className="mt-5">
          <h2>Featured Pokémon</h2>
          <div className="text-center mt-4 text-danger">
            <p>{error}</p>
            <Button
              variant="primary"
              onClick={() => {
                setError(null);
                setIsLoading(true);
                setIsContentReady(false);
                setFeaturedPokemon(null);
              }}
            >
              Retry
            </Button>
          </div>
        </section>
      </Container>
    );
  }

  // If content isn't ready or we have no featuredPokemon, show a fallback
  if (!isContentReady || !featuredPokemon) {
    return (
      <Container>
        <section className="mt-5">
          <div className="text-center mt-4">
            <Spinner animation="border" variant={theme === 'light' ? 'dark' : 'light'} />
            <p>Fetching featured Pokémon...</p>
          </div>
        </section>
      </Container>
    );
  }

  // Optional chaining to avoid .map() on undefined
  const allTypes = featuredPokemon?.types?.map((typeObj) => typeObj.type.name).join(', ');
  const allStats = featuredPokemon?.stats || [];

  return (
    <Container>
      <h2>Featured Pokémon</h2>
      <motion.section
        className="mt-5"
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3 }}
      >
        <Card data-bs-theme={theme === 'light' ? 'light' : 'dark'} className="mb-3 featured-pokemon">
          <Card.Body>
            <Row className="align-items-center">
              <Col xs={12} md={4} className="text-center mb-3">
                <Card.Img
                  src={
                    featuredPokemon.sprites?.other?.['official-artwork']?.front_default ||
                    featuredPokemon.sprites?.front_default
                  }
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
                  <strong>Type:</strong> {allTypes || 'Unknown'}
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
                    {allStats.length > 0 ? (
                      allStats.map((stat) => (
                        <tr key={stat.stat.name}>
                          <td className="text-capitalize">{stat.stat.name}</td>
                          <td>{stat.base_stat}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2}>No stats found</td>
                      </tr>
                    )}
                  </tbody>
                </Table>

                <Button as={Link} to={`/pokemon/${featuredPokemon.id}`} variant="secondary" className="mt-3">
                  View Details
                </Button>

                {species && species.flavor_text_entries && (
                  <Card.Text className="mt-3">
                    <strong>Description:</strong>{' '}
                    {species.flavor_text_entries
                      .find((entry) => entry.language.name === 'en')
                      ?.flavor_text.replace(/[\n\f]/g, ' ') || 'Description not available'}
                  </Card.Text>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </motion.section>
    </Container>
  );
};

FeaturedPokemon.propTypes = {
  section: PropTypes.string,
};

export default FeaturedPokemon;
