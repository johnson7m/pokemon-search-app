import React, { useContext, useEffect, useState, useRef } from 'react';
import { Container, Card, Button, Row, Col, Table, Spinner } from 'react-bootstrap';
import { ThemeContext } from '../contexts/ThemeContext';
import { usePokemonContext } from '../contexts/PokemonContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import './FeaturedPokemon.css'; // Custom CSS
import { getPokemonFromCache, savePokemonToCache, deletePokemonFromCache } from '../utils/cache';

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

  const isFetchingRef = useRef(false); // Prevent multiple fetches

  useEffect(() => {
    const fetchPokemonAndSpecies = async () => {
      if (isFetchingRef.current) return; // Prevent multiple concurrent fetches
      isFetchingRef.current = true;

      setIsLoading(true);
      setIsContentReady(false);
      setError(null);

      const randomId = Math.floor(Math.random() * 898) + 1;
      try {
        const cachedData = await getPokemonFromCache(randomId);

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
  }, []); // Empty dependency array ensures it only runs once on mount

  // Render loading state
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

  // Render error state
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

  // Render featured Pokémon only when content is ready
  return (
    <Container>
    <h2>Featured Pokémon</h2>
      {isContentReady && (
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
                      featuredPokemon.sprites.other['official-artwork'].front_default ||
                      featuredPokemon.sprites.front_default
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
                    <strong>Type:</strong> {featuredPokemon.types.map((type) => type.type.name).join(', ')}
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

                  <Button as={Link} to={`/pokemon/${featuredPokemon.id}`} variant="secondary" className="mt-3">
                    View Details
                  </Button>

                  {species && (
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
      )}
    </Container>
  );
};

FeaturedPokemon.propTypes = {
  section: PropTypes.string,
};

export default FeaturedPokemon;
