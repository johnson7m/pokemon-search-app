// src/components/SearchBar.js
import React, { useContext, useState } from 'react';
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
import { ThemeContext } from '../contexts/ThemeContext';
import { useXpContext } from '../contexts/XpContext';
import { usePageContext } from '../contexts/PageContext';
import PokemonGrid from './PokemonGrid';
import { usePokemonSearch } from '../hooks/usePokemonSearch';
import { usePokemonContext } from '../contexts/PokemonContext';
import { useAuthContext } from '../contexts/AuthContext';
import './SearchBar.css';
import { FaMoon, FaSun } from 'react-icons/fa';

const SearchBar = ({ onPokemonSelect }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { xpTrigger } = useXpContext();
  const { pageState, setPageState } = usePageContext();
  const { selectPokemon } = usePokemonContext();
  const { user } = useAuthContext();

  const {
    searchTerm,
    autocompleteResults,
    isLoading,
    errorMessage,
    types,
    abilitiesList,
    regions,
    filteredPokemonNames,
    filteredSearchResults,
    hasMoreResults,
    offset,
    handleInputChange,
    handleSelectAutocomplete,
    handleAdvancedSearch,  // We'll ensure this includes evolution logic
    fetchFilteredPokemon,
    setErrorMessage,
  } = usePokemonSearch(xpTrigger);

  // Local states for advanced filters
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedAbility, setSelectedAbility] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedEvolutionStage, setSelectedEvolutionStage] = useState('');  // reintroduce
  const [includeAlters, setIncludeAlters] = useState(true);

  const [showAutoComplete, setShowAutoComplete] = useState(false);

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      if (autocompleteResults.length > 0) {
        const selected = await handleSelectAutocomplete(autocompleteResults[0]);
        if (selected) {
          handleSelect(selected);
        }
      } else {
        setErrorMessage('No autocompletion match found. Please refine your search.');
      }
    }
  };


    const handleGridSelect = async (pokemon) => {
      handleSelect(pokemon);
      setShowAdvancedSearch(false);
    }


    const handleSelect  = async (pokemonObject) => {
      selectPokemon(pokemonObject);
      if (onPokemonSelect) {
        onPokemonSelect(pokemonObject);
      } else {
        setPageState('pokemonDetail')
      }
      setShowAutoComplete(false);
    }

    /** The user clicked one of the autocomplete items in the list */
    const handleAutocompleteClick = async (pokemonItem) => {
      const selected = await handleSelectAutocomplete(pokemonItem);
      if (selected) {
        handleSelect(selected);
      }
    };
  

  const formatPokemonName = (name) =>
    name.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

  // Called when user clicks "Search" in advanced
  const handleAdvancedSearchClick = async () => {
    await handleAdvancedSearch({
      selectedType,
      selectedAbility,
      selectedRegion,
      selectedEvolutionStage,
      includeAlters,
    });
  };

  return (
    <Container data-bs-theme={theme === 'light' ? 'light' : 'dark'} className="mt-3">
      <div style={{ position: 'relative' }}>
        <InputGroup>
          <FormControl
            placeholder="Search Pokémon by name or ID"
            value={searchTerm}
            onChange={(e) => {
              handleInputChange(e.target.value);
              setShowAutoComplete(true);
            }}
            onKeyDown={handleKeyDown}
            aria-label="Search Pokémon by name or ID"
          />
        </InputGroup>
        {showAutoComplete && autocompleteResults.length > 0 && (
          <ListGroup className="autocomplete-results" >
            {autocompleteResults.map((pokemon) => (
              <ListGroup.Item
                key={pokemon.name}
                action
                onClick={() => handleAutocompleteClick(pokemon)}
                className={`bg-${theme} ${theme === 'dark' ? 'text-white' : 'text-dark'}`}
              >
                {formatPokemonName(pokemon.name)}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </div>

      {errorMessage && (
        <Alert variant="danger" className="mt-3">
          {errorMessage}
        </Alert>
      )}

      <Row>
        <Col xs={12} className="mt-3 d-flex justify-content-left mb-3">
          {user && (
              <>
              <Button
                variant={theme === 'light' ? 'dark' : 'light'}
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className="me-2"
                aria-controls="advanced-search-collapse"
                aria-expanded={showAdvancedSearch}
              >
                <i className="bi bi-search" />{' '}
                <span className="d-none d-md-inline">Advanced Search</span>{' '}
                {showAdvancedSearch ? '▲' : '▼'}
              </Button>              
              <Button
                variant={theme === 'light' ? 'dark' : 'light'}
                active={pageState === 'home'}
                onClick={() => setPageState('home')}
                className="me-2"
              >
                <i className="bi bi-house" />
                <span className="d-none d-md-inline"> Home</span>
              </Button>
              <Button
                variant={theme === 'light' ? 'dark' : 'light'}
                active={pageState === 'dashboard'}
                onClick={() => setPageState('dashboard')}
                className="me-2"
              >
                <i className="bi bi-bar-chart" />
                <span className="d-none d-md-inline"> Dashboard</span>
              </Button>
              <Button
                variant={theme === 'light' ? 'dark' : 'light'}
                active={pageState === 'pokemon'}
                onClick={() => setPageState('pokemon')}
                className="me-2"
              >
                <i className="bi bi-collection" />
                <span className="d-none d-md-inline"> Pokémon</span>
              </Button>
              </>
            )}
            <Button
              variant={theme === 'light' ? 'dark' : 'light'}
              onClick={toggleTheme}
            >
              {theme === 'light' ? <FaMoon/> : <FaSun/>}
            </Button>
        </Col>
      </Row>

      <Collapse in={showAdvancedSearch}>
        <div id="advanced-search-collapse">
          <Row className="mt-3">
            {/* Type Filter */}
            <Col xs={12} md={6} lg={3}>
              <Form.Group controlId="typeSelect">
                <Form.Label>Type</Form.Label>
                {types.length ? (
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
                <Form.Label>Ability</Form.Label>
                {abilitiesList.length ? (
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
                <Form.Label>Evolution</Form.Label>
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
                <Form.Label>Region</Form.Label>
                {regions.length ? (
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
                style={{textAlign: 'left', paddingTop: '1rem'}}
                label="Include Variants"
                checked={includeAlters}
                onChange={(e) => setIncludeAlters(e.target.checked)}
              />
            </Col>
          </Row>

          <Button
            variant={theme === 'dark' ? 'light' : 'dark'}
            onClick={handleAdvancedSearchClick}
            className="mt-3"
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </Button>

          {/* Filtered Search Results */}
          {filteredSearchResults.length > 0 && (
            <div className="mt-4">
              <PokemonGrid
                pokemonList={filteredSearchResults}
                theme={theme}
                isLoading={isLoading} // pass if needed
                onPokemonSelect={handleGridSelect}
              />
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

          {/* No Results */}
          {!isLoading && filteredSearchResults.length === 0 && filteredPokemonNames.length > 0 && (
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
