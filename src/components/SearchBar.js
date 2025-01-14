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
import PokemonGrid from './PokemonGrid';
import { debounce } from 'lodash';
import { useXpContext } from '../contexts/XpContext';
import { usePageContext } from '../contexts/PageContext';
import './SearchBar.css';

const SearchBar = () => {
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
  const [searchAttempted, setSearchAttempted] = useState(false); // NEW STATE
  const { theme } = useContext(ThemeContext);
  const { pageState, setPageState } = usePageContext();
  const navigate = useNavigate();

  const [evolutionStageCache, setEvolutionStageCache] = useState({});

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

  const { xpTrigger } = useXpContext();

  const formatPokemonName = (name) => {
    return name.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const isAlteration = (name) => name.includes('-');

  const liveSearch = useCallback(
    debounce(async (searchValue) => {
      if (searchValue.trim() === '') {
        setAutocompleteResults([]);
        return;
      }
  
      let topResults = [];
      const filteredByName = allPokemonList.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(searchValue.toLowerCase())
      );
  
      if (!isNaN(searchValue)) {
        // Convert searchValue to an integer for ID-based comparison
        const id = parseInt(searchValue, 10);
  
        try {
          // Fetch Pokémon by exact ID and add it to the top of results
          const pokemonById = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
          if (pokemonById.data) {
            topResults.push({ name: pokemonById.data.name, url: pokemonById.data.species.url });
          }
        } catch (error) {
          console.warn(`No Pokémon found with exact ID ${searchValue}`);
        }
  
        // Add Pokémon whose IDs start with the search term (e.g., '1' -> '10', '11', etc.)
        const filteredByIdStart = allPokemonList.filter((pokemon, index) =>
          index.toString().startsWith(searchValue)
        );
  
        // Add unique Pokémon from filteredByIdStart to topResults
        filteredByIdStart.forEach((pokemon) => {
          if (!topResults.some((result) => result.name === pokemon.name)) {
            topResults.push(pokemon);
          }
        });
      }
  
      // Add Pokémon whose names contain the search term, ensuring no duplicates
      const filteredUniquePokemon = filteredByName.filter(
        (pokemon) => !topResults.some((result) => result.name === pokemon.name)
      );
  
      topResults = [...topResults, ...filteredUniquePokemon.slice(0, 10)];
      setAutocompleteResults(topResults);
    }, 300),
    [allPokemonList]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    liveSearch(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (autocompleteResults.length > 0) {
        handleSelectAutocomplete(autocompleteResults[0]);
      } else {
        setErrorMessage(
          'No autocompletion match found. Please refine your search or choose from the dropdown.'
        );
      }
    }
  };

  // --------------
  // CRITICAL PART: Also save search if user picks from the autocomplete
  // --------------
  const handleSelectAutocomplete = async (pokemon) => {
    try {
      // Fetch full Pokémon data by name or ID (direct URL from autocomplete result)
      const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`);
      const selectedPokemon = res.data;
  
      // Save the search so user gets XP and search history increment
      await saveSearchHistory(pokemon.name, xpTrigger);
  
      // Navigate to the Pokémon detail page with full data
      navigate(`/pokemon/${selectedPokemon.id}`, { state: { pokemon: selectedPokemon } });
    } catch (error) {
      console.error('Error fetching Pokémon data:', error);
      setErrorMessage('Failed to navigate to Pokémon details. Please try again.');
    }
  };

  const getPokemonNamesByRegion = async (regionName) => {
    try {
      const regionRes = await axios.get(`https://pokeapi.co/api/v2/region/${regionName}`);
      const generationUrl = regionRes.data.main_generation.url;
      const generationRes = await axios.get(generationUrl);
      const pokemonSpecies = generationRes.data.pokemon_species;
      const pokemonNames = pokemonSpecies.map((species) => species.name);
      return pokemonNames;
    } catch (error) {
      console.error('Error fetching Pokémon by region:', error);
      setErrorMessage('Failed to fetch Pokémon by region. Please try again.');
      return [];
    }
  };

  const getEvolutionStage = async (pokemonName) => {
    if (evolutionStageCache[pokemonName] !== undefined) {
      return evolutionStageCache[pokemonName];
    }

    try {
      const speciesRes = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`);
      const evolutionChainUrl = speciesRes.data.evolution_chain.url;
      const evolutionRes = await axios.get(evolutionChainUrl);
      const chain = evolutionRes.data.chain;

      const stages = {};
      const traverse = (node, stage) => {
        stages[node.species.name] = stage;
        node.evolves_to.forEach((evo) => traverse(evo, stage + 1));
      };
      traverse(chain, 1);

      const stage = stages[pokemonName] || 1;
      setEvolutionStageCache((prevCache) => ({
        ...prevCache,
        [pokemonName]: stage,
      }));
      return stage;
    } catch (error) {
      console.error(`Error determining evolution stage for ${pokemonName}:`, error);
      return 1;
    }
  };

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

  const handleAdvancedSearch = async () => {
    setIsLoading(true);
    setFilteredSearchResults([]);
    setOffset(0);
    setHasMoreResults(true);
    setErrorMessage('');
    setSearchAttempted(true);
    let pokemonSet = new Set();

    try {
      // Filter by Type
      if (selectedType) {
        const response = await axios.get(`https://pokeapi.co/api/v2/type/${selectedType}`);
        response.data.pokemon.forEach((p) => pokemonSet.add(p.pokemon.name));
      }

      // Filter by Ability
      if (selectedAbility) {
        const response = await axios.get(`https://pokeapi.co/api/v2/ability/${selectedAbility}`);
        const abilityPokemonNames = response.data.pokemon.map((p) => p.pokemon.name);
        if (pokemonSet.size > 0) {
          pokemonSet = new Set([...pokemonSet].filter((name) => abilityPokemonNames.includes(name)));
        } else {
          abilityPokemonNames.forEach((name) => pokemonSet.add(name));
        }
      }

      // Filter by Region
      if (selectedRegion) {
        const regionPokemonNames = await getPokemonNamesByRegion(selectedRegion);
        if (pokemonSet.size > 0) {
          pokemonSet = new Set([...pokemonSet].filter((name) => regionPokemonNames.includes(name)));
        } else {
          regionPokemonNames.forEach((name) => pokemonSet.add(name));
        }
      }

      // Filter by Evolution Stage
      if (selectedEvolutionStage) {
        const pokemonNamesArray = Array.from(
          pokemonSet.size > 0 ? pokemonSet : allPokemonList.map((p) => p.name)
        );

        const stagePromises = pokemonNamesArray.map((name) => getEvolutionStage(name).catch(() => null));
        const stages = await Promise.all(stagePromises);

        const filteredByStage = pokemonNamesArray.filter((name, index) => {
          return stages[index] === parseInt(selectedEvolutionStage) || stages[index] === null;
        });
        pokemonSet = new Set(filteredByStage);
      }

      // Exclude variants if needed
      if (!includeAlters) {
        pokemonSet = new Set([...pokemonSet].filter((name) => !isAlteration(name)));
      }

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

      // Fetch the first batch
      await fetchFilteredPokemon(allFilteredPokemonNames, 0);

      const searchDesc = `Type: ${selectedType || 'Any'}, Ability: ${selectedAbility || 'Any'}, Evolution Stage: ${
          selectedEvolutionStage ? getStageLabel(selectedEvolutionStage) : 'Any'
        }, Region: ${selectedRegion || 'Any'}`

      // Save the search
      saveSearchHistory(searchDesc, xpTrigger);
    } catch (error) {
      console.error('Error fetching filtered Pokémon:', error);
      setErrorMessage('An error occurred while fetching filtered Pokémon. Please try again.');
    }
    setIsLoading(false);
  };

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
            onKeyDown={handleKeyDown}
            aria-label="Search Pokémon by name or ID"
          />
        </InputGroup>
        {autocompleteResults.length > 0 && (
          <ListGroup className="autocomplete-results" role="listbox">
            {autocompleteResults.map((pokemon) => (
              <ListGroup.Item
                key={pokemon.name}
                action
                onClick={() => handleSelectAutocomplete(pokemon)}
                className={`bg-${theme} ${theme === 'dark' ? 'text-white' : 'text-dark'}`}
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

      {/* Advanced Search Toggle */}
       <Row>
        <Col xs={12} className="mt-3 d-flex justify-content-left mb-3">
          <Button
          variant={theme === 'light' ? 'dark' : 'light'}
          onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
          className="me-2"
          aria-controls="advanced-search-collapse"
          aria-expanded={showAdvancedSearch}
        >
          <i className='bi bi-search'> </i>
          <span className='d-none d-md-inline'> Advanced Search </span> 
          {showAdvancedSearch ? '▲' : '▼'}
        </Button>
        <Button
            variant={theme === 'light' ? 'dark' : 'light'}
            active={pageState === 'home'}
            onClick={() => setPageState('home')}
            className='me-2'
          >
            <i className='bi bi-house'></i>
            <span className='d-none d-md-inline'> Home</span> 
          </Button>
          <Button
            variant={theme === 'light' ? 'dark' : 'light'}
            active={pageState === 'dashboard'}
            onClick={() => setPageState('dashboard')}
            className='me-2'
          >
            <i className='bi bi-bar-chart'></i>
            <span className='d-none d-md-inline'> Dashboard</span> 
          </Button>
          <Button
            variant={theme === 'light' ? 'dark' : 'light'}
            active={pageState === 'pokemon'}
            onClick={() => setPageState('pokemon')}
            className='me-2'
          >
            <i className='bi bi-collection'></i>
            <span className='d-none d-md-inline'> Pokémon</span> 
          </Button>
        </Col>
       </Row>
      {/* Advanced Search Section */}
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
            {/* Include Variants */}
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

          {/* Filtered Search Results */}
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

          {/* Loading Spinner */}
          {isLoading && (
            <div className="mt-4 text-center">
              <Spinner animation="border" variant={theme === 'light' ? 'dark' : 'light'} />
            </div>
          )}

          {/* No Results Found */}
          {filteredSearchResults.length === 0 &&
            searchAttempted &&
            !isLoading &&
            (selectedType || selectedAbility || selectedRegion || selectedEvolutionStage) && (
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
