import React, { useContext, useEffect, useState } from 'react';
import { Container, Card, Button, Row, Col, Table, Spinner } from 'react-bootstrap';
import { ThemeContext } from '../contexts/ThemeContext';
import { usePokemonContext } from '../contexts/PokemonContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './FeaturedPokemon.css'; // Custom CSS

const FeaturedPokemon = () => {
  const { theme } = useContext(ThemeContext);
  const { featuredPokemon, setFeaturedPokemon } = usePokemonContext();
  const [species, setSpecies] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Unified loading state

  useEffect(() => {
    const fetchPokemonAndSpecies = async () => {
      setIsLoading(true); // Start unified loading
      try {
        // Fetch random Pokémon
        const randomId = Math.floor(Math.random() * 898) + 1;
        const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
        const pokemonData = pokemonResponse.data;
        setFeaturedPokemon(pokemonData);

        // Fetch species data for the Pokémon
        const speciesResponse = await axios.get(pokemonData.species.url);
        setSpecies(speciesResponse.data);
      } catch (error) {
        console.error('Error fetching Pokémon or species data:', error);
      } finally {
        setIsLoading(false); // End unified loading
      }
    };
    fetchPokemonAndSpecies();
  }, [setFeaturedPokemon]);

  // Show spinner until both Pokémon and species are fully loaded
  if (isLoading) {
    return (
      <div className="text-center mt-3">
        <Spinner animation="border" variant={theme === 'light' ? 'dark' : 'light'} />
        <p>Loading featured Pokémon...</p>
      </div>
    );
  }

  return (
    <section className="mt-5">
      <h2>Featured Pokémon</h2>
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
                  {species.flavor_text_entries.find((entry) => entry.language.name === 'en')?.flavor_text.replace(
                    /[\n\f]/g,
                    ' '
                  ) || 'Description not available'}
                </Card.Text>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </section>
  );
};

export default FeaturedPokemon;
