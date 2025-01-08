// src/components/SearchBar.js
import React, { useEffect, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  InputGroup,
  FormControl,
  Spinner,
  Collapse,
  ListGroup,
  Alert,
} from 'react-bootstrap';
import { saveSearchHistory } from '../services/firestoreService';
import { ThemeContext } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import PokemonGrid from './PokemonGrid'; // Ensure this component exists
import { debounce } from 'lodash';
import './SearchBar.css'; // Ensure this CSS file handles .autocomplete-results

const SearchBar = () => {
  // State Variables
  const [searchTerm, setSearchTerm] = useState('');
  const [includeAlters, setIncludeAlters] = useState(true);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [abilitiesList, setAbilitiesList] = useState([]);
  const [selectedAbility, setSelectedAbility] = useState('');
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedEvolutionStage, setSelectedEvolutionStage] = useState('');
  const [allPokemonList, setAllPokemonList] = useState([]);
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filteredPokemonNames, setFilteredPokemonNames] = useState([]);
  const [filteredSearchResults, setFilteredSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMoreResults, setHasMoreResults] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  // Cache for Evolution Stages to avoid redundant API calls
  const [evolutionStageCache, setEvolutionStageCache] = useState({});

  // Fetch Types, Abilities, Regions, and All Pokémon on Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesRes, abilitiesRes, regionsRes, allPokemonRes] = await Promise.all([
          axios.get('https://pokeapi.co/api/v2/type'),
          axios.get('https://pokeapi.co/api/v2/ability?limit=100000'),
          axios.get('https://pokeapi.co/api/v2/region'),
          axios.get('https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0'),
        ]);

        setTypes(typesRes.data.results);
        setAbilitiesList(abilitiesRes.data.results);
        setRegions(regionsRes.data.results);
        setAllPokemonList(allPokemonRes.data.results);
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMessage('Failed to load search options. Please try again later.');
      }
    };
    fetchData();
  }, []);

  const formatPokemonName = (name) => {
    return name.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const isAlteration = (name) => name.includes('-');

  // Live Search Function with Debouncing
  const liveSearch = useCallback(
    debounce(async (searchValue) => {
      if (searchValue.trim() === '') {
        setAutocompleteResults([]);
        return;
      }

      const filteredPokemon = allPokemonList.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(searchValue.toLowerCase())
      );

      const topResults = filteredPokemon.slice(0, 10);
      setAutocompleteResults(topResults);
    }, 300),
    [allPokemonList]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    liveSearch(value);
  };

  const handleSelectAutocomplete = async (pokemon) => {
    try {
      const res = await axios.get(pokemon.url);
      const selectedPokemon = res.data;
      navigate(`/pokemon/${selectedPokemon.id}`, { state: { pokemon: selectedPokemon } });
    } catch (error) {
      console.error('Error fetching Pokémon data:', error);
      setErrorMessage('Failed to navigate to Pokémon details. Please try again.');
    }
  };

  // Helper Function to Get Pokémon Names by Region
  const getPokemonNamesByRegion = async (regionName) => {
    try {
      const regionRes = await axios.get(`https://pokeapi.co/api/v2/region/${regionName}`);
      const generationUrl = regionRes.data.main_generation.url;

      const generationRes = await axios.get(generationUrl);
      const pokemonSpecies = generationRes.data.pokemon_species;

      // Map species to Pokémon names
      const pokemonNames = pokemonSpecies.map((species) => species.name);
      return pokemonNames;
    } catch (error) {
      console.error('Error fetching Pokémon by region:', error);
      setErrorMessage('Failed to fetch Pokémon by region. Please try again.');
      return [];
    }
  };

  // Helper Function to Determine the Evolution Stage of a Pokémon
  const getEvolutionStage = async (pokemonName) => {
    // Check if the evolution stage is already cached
    if (evolutionStageCache[pokemonName] !== undefined) {
      return evolutionStageCache[pokemonName];
    }

    try {
      const speciesRes = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`);
      const evolutionChainUrl = speciesRes.data.evolution_chain.url;

      const evolutionRes = await axios.get(evolutionChainUrl);
      const chain = evolutionRes.data.chain;

      // Traverse the evolution chain to assign stages
      const stages = {};

      const traverse = (node, stage) => {
        stages[node.species.name] = stage;
        node.evolves_to.forEach((evo) => traverse(evo, stage + 1));
      };

      traverse(chain, 1);

      const stage = stages[pokemonName] || 1;

      // Update the cache
      setEvolutionStageCache((prevCache) => ({
        ...prevCache,
        [pokemonName]: stage,
      }));

      return stage;
    } catch (error) {
      console.error(`Error determining evolution stage for ${pokemonName}:`, error);
      return 1; // Default to stage 1 if error occurs
    }
  };

  // Helper Function to Map Stage Number to Label
  const getStageLabel = (stageNumber) => {
    switch (stageNumber) {
      case 1:
        return 'Base Form';
      case 2:
        return 'First Evolution';
      case 3:
        return 'Second Evolution';
      default:
        return 'Unknown';
    }
  };

  // Advanced Search Handler
  const handleAdvancedSearch = async () => {
    setIsLoading(true);
    setFilteredSearchResults([]);
    setOffset(0);
    setHasMoreResults(true);
    setErrorMessage('');

    let pokemonSet = new Set();

    try {
      // Fetch Pokémon by Type
      if (selectedType) {
        const response = await axios.get(`https://pokeapi.co/api/v2/type/${selectedType}`);
        response.data.pokemon.forEach((p) => pokemonSet.add(p.pokemon.name));
      }

      // Fetch Pokémon by Ability
      if (selectedAbility) {
        const response = await axios.get(`https://pokeapi.co/api/v2/ability/${selectedAbility}`);
        const abilityPokemonNames = response.data.pokemon.map((p) => p.pokemon.name);
        if (pokemonSet.size > 0) {
          // Intersection
          pokemonSet = new Set([...pokemonSet].filter((name) => abilityPokemonNames.includes(name)));
        } else {
          abilityPokemonNames.forEach((name) => pokemonSet.add(name));
        }
      }

      // Fetch Pokémon by Region
      if (selectedRegion) {
        const regionPokemonNames = await getPokemonNamesByRegion(selectedRegion);
        if (pokemonSet.size > 0) {
          // Intersection
          pokemonSet = new Set([...pokemonSet].filter((name) => regionPokemonNames.includes(name)));
        } else {
          regionPokemonNames.forEach((name) => pokemonSet.add(name));
        }
      }

      // Fetch Pokémon by Evolution Stage
      if (selectedEvolutionStage) {
        const pokemonNamesArray = Array.from(pokemonSet.size > 0 ? pokemonSet : allPokemonList.map((p) => p.name));
        
        const stagePromises = pokemonNamesArray.map((name) => 
          getEvolutionStage(name).catch(() => null)
      );
        const stages = await Promise.all(stagePromises);

        const filteredByStage = pokemonNamesArray.filter((name, index) =>  {
          return stages[index] === parseInt(selectedEvolutionStage) || stages[index] === null;
        });

        pokemonSet = new Set(filteredByStage);
      }

      if (!includeAlters) {
        pokemonSet = new Set([...pokemonSet].filter((name) => !isAlteration(name)));
      }

      // If no filters selected, return empty results
      if (pokemonSet.size === 0) {
        setFilteredPokemonNames([]);
        setFilteredSearchResults([]);
        setHasMoreResults(false);
        setErrorMessage('No Pokémon found matching the selected criteria.');
        setIsLoading(false);
        return;
      }

      const allFilteredPokemonNames = Array.from(pokemonSet);
      setFilteredPokemonNames(allFilteredPokemonNames);

      // Fetch the first batch of Pokémon
      await fetchFilteredPokemon(allFilteredPokemonNames, 0);

      saveSearchHistory(
        `Type: ${selectedType || 'Any'}, Ability: ${selectedAbility || 'Any'}, Evolution Stage: ${
          selectedEvolutionStage ? getStageLabel(selectedEvolutionStage) : 'Any'
        }, Region: ${selectedRegion || 'Any'}`
      );
    } catch (error) {
      console.error('Error fetching filtered Pokémon:', error);
      setErrorMessage('An error occurred while fetching filtered Pokémon. Please try again.');
    }
    setIsLoading(false);
  };

  // Function to Fetch Filtered Pokémon with Pagination
  const fetchFilteredPokemon = async (pokemonNamesList, currentOffset) => {
    setIsLoading(true);
    const paginatedPokemonNames = pokemonNamesList.slice(currentOffset, currentOffset + 8);

    try {
      const detailedPokemons = await Promise.all(
        paginatedPokemonNames.map(async (name) => {
          try {
            const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
            return res.data;
          } catch (error) {
            console.error('Error fetching Pokémon data:', error);
            return null;
          }
        })
      );

      const validPokemons = detailedPokemons.filter((p) => p !== null);

      setFilteredSearchResults((prev) => [...prev, ...validPokemons]);
      setOffset(currentOffset + 8);

      if (currentOffset + 8 >= pokemonNamesList.length) {
        setHasMoreResults(false);
      }
    } catch (error) {
      console.error('Error fetching detailed Pokémon data:', error);
      setErrorMessage('Failed to load more Pokémon. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <Container data-bs-theme={theme === 'light' ? 'light' : 'dark'} className="mt-3">
      {/* Live Search Input */}
      <div style={{ position: 'relative' }}>
        <InputGroup>
          <FormControl
            placeholder="Search Pokémon by name or ID"
            value={searchTerm}
            onChange={handleInputChange}
            aria-label="Search Pokémon by name or ID"
          />
        </InputGroup>
        {autocompleteResults.length > 0 && (
          <ListGroup className="autocomplete-results" role="listbox">
            {autocompleteResults.map((pokemon, index) => (
              <ListGroup.Item
                key={pokemon.name}
                action
                onClick={() => handleSelectAutocomplete(pokemon)}
                className={`bg-${theme} ${
                  theme === 'dark' ? 'text-white' : 'text-dark'
                }`}
                role="option"
                aria-selected="false"
                tabIndex="0"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSelectAutocomplete(pokemon);
                  }
                }}
              >
                {formatPokemonName(pokemon.name)}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </div>

      {/* Display Error Message */}
      {errorMessage && (
        <Alert variant="danger" className="mt-3">
          {errorMessage}
        </Alert>
      )}

      {/* Advanced Search Toggle Button */}
      <Button
        variant={theme === 'light' ? 'dark' : 'light'}
        onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
        className="mt-3"
        aria-controls="advanced-search-collapse"
        aria-expanded={showAdvancedSearch}
      >
        Advanced Search {showAdvancedSearch ? '▲' : '▼'}
      </Button>

      {/* Advanced Search Collapse */}
      <Collapse in={showAdvancedSearch}>
        <div id="advanced-search-collapse">
          <Row className="mt-3">
            {/* Type Filter */}
            <Col xs={12} md={6} lg={3}>
              <Form.Group controlId="typeSelect">
                <Form.Label>Select Type</Form.Label>
                {types.length > 0 ? (
                  <Form.Control
                    as="select"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="">Any</option>
                    {types.map((type) => (
                      <option key={type.name} value={type.name}>
                        {type.name}
                      </option>
                    ))}
                  </Form.Control>
                ) : (
                  <Spinner animation="border" size="sm" />
                )}
              </Form.Group>
            </Col>
            {/* Ability Filter */}
            <Col xs={12} md={6} lg={3}>
              <Form.Group controlId="abilitySelect">
                <Form.Label>Select Ability</Form.Label>
                {abilitiesList.length > 0 ? (
                  <Form.Control
                    as="select"
                    value={selectedAbility}
                    onChange={(e) => setSelectedAbility(e.target.value)}
                  >
                    <option value="">Any</option>
                    {abilitiesList.map((ability) => (
                      <option key={ability.name} value={ability.name}>
                        {ability.name}
                      </option>
                    ))}
                  </Form.Control>
                ) : (
                  <Spinner animation="border" size="sm" />
                )}
              </Form.Group>
            </Col>
            {/* Evolution Stage Filter */}
            <Col xs={12} md={6} lg={3}>
              <Form.Group controlId="evolutionSelect">
                <Form.Label>Select Evolution Stage</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedEvolutionStage}
                  onChange={(e) => setSelectedEvolutionStage(e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="1">Base Form</option>
                  <option value="2">First Evolution</option>
                  <option value="3">Second Evolution</option>
                </Form.Control>
              </Form.Group>
            </Col>
            {/* Region Filter */}
            <Col xs={12} md={6} lg={3}>
              <Form.Group controlId="regionSelect">
                <Form.Label>Select Region</Form.Label>
                {regions.length > 0 ? (
                  <Form.Control
                    as="select"
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                  >
                    <option value="">Any</option>
                    {regions.map((region) => (
                      <option key={region.name} value={region.name}>
                        {region.name}
                      </option>
                    ))}
                  </Form.Control>
                ) : (
                  <Spinner animation="border" size="sm" />
                )}
              </Form.Group>
            </Col>
            {/* Alter Toggle */}
            <Col xs={12}>
              <Form.Check
                type="switch"
                id="alter-toggle"
                label="Include Variants"
                checked={includeAlters}
                onChange={(e) => setIncludeAlters(e.target.checked)}
              />
            </Col>            
          </Row>
          {/* Search Button */}
          <Button
            variant={theme === 'dark' ? 'light' : 'dark'}
            onClick={handleAdvancedSearch}
            className="mt-3"
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </Button>

          {/* Filtered Search Results Within Collapse */}
          {filteredSearchResults.length > 0 && (
            <div className="mt-4">
              <PokemonGrid pokemonList={filteredSearchResults} theme={theme} />
              {hasMoreResults && (
                <Button
                  variant="secondary"
                  onClick={() => fetchFilteredPokemon(filteredPokemonNames, offset)}
                  disabled={isLoading}
                  className="mt-3"
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </Button>
              )}
            </div>
          )}

          {/* Loading Spinner Within Collapse */}
          {isLoading && (
            <div className="mt-4 text-center">
              <Spinner
                animation="border"
                variant={theme === 'light' ? 'dark' : 'light'}
              />
            </div>
          )}

          {/* No Results Found */}
          {filteredSearchResults.length === 0 && !isLoading && selectedType && selectedAbility && (
            <Alert variant="info" className="mt-4">
              No Pokémon found matching the selected criteria.
            </Alert>
          )}
        </div>
      </Collapse>
    </Container>
  );
};

export default SearchBar;
