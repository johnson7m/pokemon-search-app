// src/pages/PokemonDetailPage.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Toast,
  Table,
  ToggleButtonGroup,
  ToggleButton,
  Spinner,
  Collapse,
} from 'react-bootstrap';
import { toggleFavoritePokemon, getFavoritePokemon } from '../services/firestoreService';
import useToast from '../hooks/useToast';
import axios from 'axios';
import { ThemeContext } from '../contexts/ThemeContext';
import { useAuthContext } from '../contexts/AuthContext';
import { useXpContext } from '../contexts/XpContext';
import './PokemonDetailPage.css';
import { usePokemonContext } from '../contexts/PokemonContext';
import { getPokemonByIdOrName } from '../utils/pokemonCache';
import { AnimatePresence, motion } from 'framer-motion';

const containerVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

const PokemonDetailPage = ({ propPokemon, onBack }) => {
  const [species, setSpecies] = useState(null);
  const [evolutionChain, setEvolutionChain] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [alternateForms, setAlternateForms] = useState([]);
  const [showAlternates, setShowAlternates] = useState(false);
  const [loadingAlternates, setLoadingAlternates] = useState(false);
  const [retroMode, setRetroMode] = useState(false);
  const [imageType, setImageType] = useState('classic');
  const alternateFormsRef = useRef(null);

  const { theme } = useContext(ThemeContext);
  const { user } = useAuthContext();
  const { xpTrigger } = useXpContext();
  const { selectedPokemon, selectPokemon } = usePokemonContext();

  const {
    showToast,
    toastMessage,
    toastVariant,
    setShowToast,
    triggerToast,
  } = useToast();

  const [pokemon, setPokemon] = useState(null);

  // Accept propPokemon or fallback to selected
  useEffect(() => {
    if (propPokemon) {
      selectPokemon(propPokemon);
      setPokemon(propPokemon);
    } else if (selectedPokemon) {
      setPokemon(selectedPokemon);
    } else {
      const fetchFallback = async () => {
        const fallback = await getPokemonByIdOrName('pikachu');
        if (fallback) {
          setPokemon(fallback);
        }
      };
      fetchFallback();
    }
  }, [propPokemon, selectedPokemon, selectPokemon]);

  // Check if favorite
  useEffect(() => {
    const checkFavorites = async () => {
      if (user && pokemon?.id) {
        const favorites = await getFavoritePokemon();
        setIsFavorite(favorites.some((fav) => fav.id === pokemon.id));
      } else {
        setIsFavorite(false);
      }
    };
    checkFavorites();
  }, [user, pokemon]);

  // Fetch species + evolution chain
  useEffect(() => {
    const fetchSpecies = async () => {
      if (!pokemon?.id) return;
      try {
        const response = await axios.get(
          `https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`
        );
        setSpecies(response.data);

        // Evolution chain
        const evolutionResponse = await axios.get(response.data.evolution_chain.url);
        setEvolutionChain(evolutionResponse.data);
      } catch (error) {
        console.error('Error fetching Pokémon species data:', error);
      }
    };
    if (pokemon?.id) {
      fetchSpecies();
    }
  }, [pokemon]);

  useEffect(() => {
    if (pokemon) {
      setShowAlternates(false);
      setAlternateForms([]);
    }
  }, [pokemon]);

  // If no Pokemon is ready, fallback
  if (!pokemon) {
    return (
      <Container
        data-bs-theme={theme}
        className="mt-5 text-center"
        role="status"
        aria-label="Loading fallback Pokémon..."
      >
        <Spinner
          animation="border"
          variant={theme === 'light' ? 'dark' : 'light'}
        />
        <p className="mt-3">Loading fallback Pokémon...</p>
      </Container>
    );
  }

  // Fav toggling
  const handleToggleFavorite = async () => {
    if (!user) {
      triggerToast('Please log in to save favorites.', 'warning');
      return;
    }
    if (!pokemon) return;

    const result = await toggleFavoritePokemon(pokemon, xpTrigger);
    setIsFavorite(!isFavorite);
    triggerToast(result.message, result.success ? 'success' : 'danger');
  };

  // For naming convenience
  const formatPokemonName = (name) =>
    name.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

  const hasAlternateForms = () =>
    species && species.varieties && species.varieties.length > 1;

  // Fetch alt forms
  const fetchAlternateForms = async () => {
    if (!species) return;
    setLoadingAlternates(true);
    try {
      const alternates = species.varieties
        .filter((variety) => variety.pokemon.name !== pokemon.name)
        .map((variety) => variety.pokemon.name);

      const alternateData = await Promise.all(
        alternates.map(async (name) => {
          try {
            const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
            return res.data;
          } catch (error) {
            console.error(`Error fetching data for ${name}:`, error);
            return null;
          }
        })
      );
      setAlternateForms(alternateData.filter(Boolean));
    } catch (error) {
      console.error('Error fetching alternate forms:', error);
      triggerToast('Failed to load alternate forms.', 'danger');
    } finally {
      setLoadingAlternates(false);
    }
  };

  // Evolution chain rendering
  const renderEvolutionChain = () => {
    if (!evolutionChain) return null;

    const evoChain = [];
    let evoData = evolutionChain.chain;

    do {
      const speciesName = evoData.species.name;
      const speciesUrl = evoData.species.url;
      const speciesId = speciesUrl.split('/').slice(-2, -1)[0];

      evoChain.push({ speciesName, speciesId });

      evoData = evoData.evolves_to[0];
    } while (evoData && evoData.hasOwnProperty('evolves_to'));

    return (
      <Row className="mt-5">
        <Col>
          <h3 className="text-center mb-4">Evolution Chain</h3>
          <div className="d-flex justify-content-center align-items-center evolution-chain">
            {evoChain.map((evo, index) => (
              <React.Fragment key={evo.speciesId}>
                <div className="evolution-item text-center" aria-label={`evolution-step-${evo.speciesName}`}>
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.speciesId}.png`}
                    alt={evo.speciesName}
                    className="evolution-image mb-2"
                    onClick={async () => {
                      const evoPoke = await getPokemonByIdOrName(evo.speciesId);
                      selectPokemon(evoPoke);
                    }}
                  />
                  <p className="text-capitalize">{evo.speciesName}</p>
                </div>
                {index < evoChain.length - 1 && (
                  <div className="mx-3 evolution-arrow">
                    <span className="arrow">&rarr;</span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </Col>
      </Row>
    );
  };

  const spriteUrl =
    imageType === 'classic'
      ? pokemon.sprites?.front_default
      : pokemon.sprites?.other?.['official-artwork']?.front_default ||
        pokemon.sprites?.front_default;

  // Render
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pokemon.id /* This triggers re-animation when 'pokemon' changes */}
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3 }}
      >
        <Container data-bs-theme={theme} className="mt-5" aria-live="polite">
          {/* "Back" button, so we can revert to previous tab */}
          {onBack && (
            <Button
              variant="secondary"
              onClick={onBack}
              className="mb-2"
              aria-label="Go back"
            >
              &larr; Back
            </Button>
          )}

          <Card
            data-bs-theme={theme === 'light' ? 'light' : 'dark'}
            className="shadow mt-3 magical-card"
          >
            <Card.Body>
              <Card.Title
                as="h2"
                className="text-capitalize text-center"
                tabIndex="0"
              >
                {pokemon.name}
              </Card.Title>
              <Row className="align-items-center">
                <Col xs={12} md={4} className="text-center mb-3">
                  <Card.Img
                    src={spriteUrl}
                    alt={pokemon.name}
                    className="img-fluid main-pokemon-image"
                  />
                  <ToggleButtonGroup
                    type="radio"
                    name="imageType"
                    value={imageType}
                    onChange={setImageType}
                    className="mt-2"
                    aria-label="Select image style"
                  >
                    <ToggleButton
                      id="tbg-radio-1"
                      value="classic"
                      variant="outline-secondary"
                      aria-label="Classic Sprite"
                    >
                      Classic
                    </ToggleButton>
                    <ToggleButton
                      id="tbg-radio-2"
                      value="high-res"
                      variant="outline-secondary"
                      aria-label="High resolution artwork"
                    >
                      High-Res
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Col>
                <Col xs={12} md={8} className="mb-3">
                  <Row>
                    <Col xs={6}>
                      <p>
                        <strong>ID:</strong> {pokemon.id}
                      </p>
                      <p>
                        <strong>Height:</strong> {pokemon.height}
                      </p>
                    </Col>
                    <Col xs={6}>
                      <p>
                        <strong>Weight:</strong> {pokemon.weight}
                      </p>
                      <p>
                        <strong>Types:</strong>{' '}
                        {pokemon.types.map((t) => t.type.name).join(', ')}
                      </p>
                    </Col>
                  </Row>
                  <Button
                    variant={isFavorite ? 'danger' : 'success'}
                    onClick={handleToggleFavorite}
                    className="mt-3"
                    aria-pressed={isFavorite}
                    aria-label={
                      isFavorite
                        ? 'Remove from Favorites'
                        : 'Add to Favorites'
                    }
                  >
                    {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </Button>
                  <Toast
                    onClose={() => setShowToast(false)}
                    show={showToast}
                    delay={3000}
                    autohide
                    style={{ position: 'absolute', top: 20, right: 20 }}
                  >
                    <Toast.Body className={`text-white bg-${toastVariant}`}>
                      {toastMessage}
                    </Toast.Body>
                  </Toast>
                </Col>
              </Row>

              {/* Stats */}
              <Row className="mt-4">
                <Col>
                  <h3>Stats</h3>
                  <Table striped bordered hover variant={theme}>
                    <tbody>
                      {pokemon.stats.map((stat) => (
                        <tr key={stat.stat.name}>
                          <td className="text-capitalize">{stat.stat.name}</td>
                          <td>{stat.base_stat}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Col>
              </Row>

              {/* Abilities and Description */}
              <Row className="mt-4">
                <Col xs={12} md={6}>
                  <h3>Abilities</h3>
                  <ul>
                    {pokemon.abilities.map((ability) => (
                      <li
                        key={ability.ability.name}
                        className="text-capitalize"
                      >
                        {ability.ability.name}
                      </li>
                    ))}
                  </ul>
                </Col>
                {species && (
                  <Col xs={12} md={6}>
                    <h3>Description</h3>
                    <p>
                      {retroMode
                        ? species.flavor_text_entries
                            .find((entry) => entry.language.name === 'en')
                            ?.flavor_text.replace(/[\n\f]/g, ' ')
                            .replace(/pok[eÉ]mon/gi, 'Pokémon')
                            .replace(/\b[A-Z][A-Z]+\b/g, (w) =>
                              formatPokemonName(w.toLowerCase())
                            ) || 'Description not available.'
                        : species.flavor_text_entries
                            .find((entry) => entry.language.name === 'en')
                            ?.flavor_text.replace(/[\n\f]/g, ' ') ||
                          'Description not available.'}
                    </p>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>

          {/* Evolution Chain */}
          {renderEvolutionChain()}

          {/* Alternate Forms */}
          {hasAlternateForms() && (
            <Button
              variant={theme === 'light' ? 'dark' : 'light'}
              onClick={async () => {
                if (!showAlternates) {
                  await fetchAlternateForms();
                }
                setShowAlternates(!showAlternates);
              }}
              className="mt-3 mb-5 d-block mx-auto"
              aria-controls="alternate-forms-collapse"
              aria-expanded={showAlternates}
            >
              {showAlternates ? 'Hide Variants' : 'Show Variants'}
            </Button>
          )}
          <Collapse
            in={showAlternates}
            onEntered={() =>
              alternateFormsRef.current?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <div id="alternate-forms-collapse" ref={alternateFormsRef}>
              {loadingAlternates && (
                <div className="mt-3 text-center">
                  <Spinner
                    animation="border"
                    variant={theme === 'light' ? 'dark' : 'light'}
                  />
                  <p>Loading alternate forms...</p>
                </div>
              )}

              {alternateForms.length > 0 && (
                <Row className="mt-5">
                  <Col>
                    <h3 className="text-center mb-4">Alternate Forms</h3>
                    <Row>
                      {alternateForms.map((alt) => (
                        <Col
                          xs={6}
                          sm={4}
                          md={3}
                          lg={3}
                          className="mb-4"
                          key={alt.id}
                        >
                          <Card
                            className="h-100 text-center shadow-sm pokemon-card"
                            onClick={async () => {
                              const altPoke = await getPokemonByIdOrName(
                                alt.name
                              );
                              selectPokemon(altPoke);
                            }}
                            role="button"
                            aria-label={`Alternate form ${alt.name}`}
                          >
                            <Card.Img
                              variant="top"
                              src={alt.sprites.front_default}
                              alt={alt.name}
                              className="pokemon-image"
                            />
                            <Card.Body>
                              <Card.Title className="text-center text-capitalize">
                                {formatPokemonName(alt.name)}
                              </Card.Title>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Col>
                </Row>
              )}
            </div>
          </Collapse>
        </Container>
      </motion.div>
    </AnimatePresence>
  );
};

export default PokemonDetailPage;
