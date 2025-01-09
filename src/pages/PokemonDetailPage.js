// src/pages/PokemonDetailPage.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useParams, Link, useNavigate } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
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
import './PokemonDetailPage.css'; // Import custom CSS for styling
import SearchBar from '../components/SearchBar';

const PokemonDetailPage = () => {
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null); // Species data
  const [evolutionChain, setEvolutionChain] = useState(null); // Evolution chain data
  const [isFavorite, setIsFavorite] = useState(false);
  const [alternateForms, setAlternateForms] = useState([]);
  const [showAlternates, setShowAlternates] = useState(false);
  const [loadingAlternates, setLoadingAlternates] = useState(false);
  const [imageType, setImageType] = useState('classic'); // 'classic' or 'high-res'
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();

  const {
    showToast,
    toastMessage,
    toastVariant,
    setShowToast,
    triggerToast,
  } = useToast();


  const { user } = useAuthContext();
  const { theme } = useContext(ThemeContext);
  const { xpTrigger } = useXpContext();
  const alternateFormsRef = useRef(null);


  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        let pokemonData = location.state?.pokemon;
        if (!pokemonData) {
          // If no data passed via state, fetch it using the ID from params
          const response = await axios.get(
            `https://pokeapi.co/api/v2/pokemon/${params.id}`
          );
          pokemonData = response.data;
        }
        setPokemon(pokemonData);

        // Check if this Pokémon is in favorites
        if (user) {
          const favorites = await getFavoritePokemon();
          setIsFavorite(favorites.some((fav) => fav.id === pokemonData.id));
        } else {
          setIsFavorite(false);
        }
      } catch (error) {
        console.error('Error fetching Pokémon data:', error);
      }
    };

    fetchPokemon();
  }, [location.state, params.id, user]);

  // Fetch Pokémon species data and evolution chain
  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const response = await axios.get(
          `https://pokeapi.co/api/v2/pokemon-species/${params.id}`
        );
        setSpecies(response.data);

        // Fetch Evolution Chain data
        const evolutionResponse = await axios.get(response.data.evolution_chain.url);
        setEvolutionChain(evolutionResponse.data);
      } catch (error) {
        console.error('Error fetching Pokémon species data:', error);
      }
    };

    fetchSpecies();
  }, [params.id]);

  const fetchAlternateForms = async () => {
    if (!species) return;
    
    setLoadingAlternates(true); // Set loading state
  
    try {
      const alternates = species.varieties
      .filter((variety) => variety.pokemon.name !== pokemon.name) //excluding base form
      .map((variety) => variety.pokemon.name);
  
      // Fetch detailed data for each alternate form
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
  
      setAlternateForms(alternateData.filter((data) => data !== null)); // Set valid alternate forms


    } catch (error) {
      console.error('Error fetching alternate forms:', error);
      triggerToast('Failed to load alternate forms.', 'danger');
    } finally {
      setLoadingAlternates(false); // Reset loading state
    }
  };  
  
  const formatPokemonName = (name) => {
    return name.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  };

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

  const hasAlternateForms = () => {
    return species && species.varieties.length > 1;
  }

  const handleImageToggle = (value) => {
    setImageType(value);
  };

  const renderEvolutionChain = () => {
    if (!evolutionChain) return null;

    const evoChain = [];
    let evoData = evolutionChain.chain;

    do {
      const speciesName = evoData.species.name;
      const speciesUrl = evoData.species.url;
      const speciesId = speciesUrl.split('/').slice(-2, -1)[0];

      evoChain.push({
        speciesName,
        speciesId,
      });

      evoData = evoData.evolves_to[0];
    } while (evoData && evoData.hasOwnProperty('evolves_to'));

    return (
      <Row className="mt-5">
        <Col>
          <h3 className="text-center mb-4">Evolution Chain</h3>
          <div className="d-flex justify-content-center align-items-center evolution-chain">
            {evoChain.map((evo, index) => (
              <React.Fragment key={evo.speciesId}>
                <div className="evolution-item text-center">
                  <Link
                    to={`/pokemon/${evo.speciesId}`}
                    className={`text-decoration-none ${
                      theme === 'light' ? 'text-dark' : 'text-white'
                    }`}
                  >
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.speciesId}.png`}
                      alt={evo.speciesName}
                      className="evolution-image mb-2"
                    />
                    <p className="text-capitalize">{evo.speciesName}</p>
                  </Link>
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

  if (!pokemon) {
    return (
      <Container data-bs-theme={theme} className="mt-5 text-center">
        <Spinner animation="border" variant={theme === 'light' ? 'dark' : 'light'} />
        <p className="mt-3">Loading Pokémon data...</p>
      </Container>
    );
  }

  const spriteUrl =
    imageType === 'classic'
      ? pokemon.sprites.front_default
      : pokemon.sprites.other['official-artwork'].front_default ||
        pokemon.sprites.front_default;

  return (
    <Container data-bs-theme={theme} className="mt-5">
      <SearchBar/>
      <Card data-bs-theme={theme === 'light' ? 'light' : 'dark'} className="shadow mt-3">
        <Card.Body>
          <Card.Title as="h2" className="text-capitalize text-center">
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
                onChange={handleImageToggle}
                className="mt-2"
              >
                <ToggleButton
                  id="tbg-radio-1"
                  value={'classic'}
                  variant="outline-secondary"
                >
                  Classic
                </ToggleButton>
                <ToggleButton
                  id="tbg-radio-2"
                  value={'high-res'}
                  variant="outline-secondary"
                >
                  High-Res
                </ToggleButton>
              </ToggleButtonGroup>
            </Col>
            <Col xs={12} md={8} className="mb-3">
              <Row>
                <Col xs={6} sm={6} md={6}>
                  <p>
                    <strong>ID:</strong> {pokemon.id}
                  </p>
                  <p>
                    <strong>Height:</strong> {pokemon.height}
                  </p>
                </Col>
                <Col xs={6} sm={6} md={6}>
                  <p>
                    <strong>Weight:</strong> {pokemon.weight}
                  </p>
                  <p>
                    <strong>Types:</strong>{' '}
                    {pokemon.types.map((typeInfo) => typeInfo.type.name).join(', ')}
                  </p>
                </Col>
              </Row>
              <Button
                variant={isFavorite ? 'danger' : 'success'}
                onClick={handleToggleFavorite}
                className="mt-3"
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
                  <li key={ability.ability.name} className="text-capitalize">
                    {ability.ability.name}
                  </li>
                ))}
              </ul>
            </Col>
            {species && (
              <Col xs={12} md={6}>
                <h3>Description</h3>
                <p>
                  {species.flavor_text_entries
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
      {/* Alternate Forms Button */}
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

      {/* Alternate Forms Section */}
      <Collapse in={showAlternates} onEntered={() => alternateFormsRef.current.scrollIntoView({ behavior: 'smooth' })}>
        <div id="alternate-forms-collapse" ref={alternateFormsRef}>
          {loadingAlternates && (
            <div className="mt-3 text-center">
              <Spinner animation="border" variant={theme === 'light' ? 'dark' : 'light'} />
              <p>Loading alternate forms...</p>
            </div>
          )}

          {alternateForms.length > 0 && (
            <Row className="mt-5">
              <Col>
                <h3 className="text-center mb-4">Alternate Forms</h3>
                <Row>
                  <TransitionGroup component={null}>
                    {alternateForms.map((alt) => (
                      <CSSTransition key={alt.id} timeout={300} classNames="pokemon-item">
                        <Col xs={6} sm={4} md={3} lg={3} className="mb-4">
                          <Card
                            as={Link}
                            to={`/pokemon/${alt.id}`}
                            data-bs-theme={theme}
                            className="h-100 text-center shadow-sm pokemon-card"
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
                      </CSSTransition>
                    ))}
                  </TransitionGroup>
                </Row>
              </Col>
            </Row>
          )}
        </div>
      </Collapse>      
    </Container>
  );
};

export default PokemonDetailPage;


