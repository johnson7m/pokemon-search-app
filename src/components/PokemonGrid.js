// src/components/PokemonGrid.js
import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import PokemonGridSkeleton from './PokemonGridSkeleton'; // Import Skeleton
import LoadingOverlay from './LoadingOverlay'; // Import LoadingOverlay
import './PokemonGrid.css'; // Ensure this CSS includes animation classes

const PokemonGrid = ({ pokemonList, theme, isLoading }) => {
  if (isLoading && pokemonList.length === 0) {
    // Display skeletons when loading and no Pokémon are present
    return <PokemonGridSkeleton />;
  }

  const formatPokemonName = (name) => {
    return name.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div style={{ position: 'relative' }}>
      {isLoading && pokemonList.length > 0 && (
        <>
          <LoadingOverlay type="spinner" />
          <LoadingOverlay type="shimmer" />
        </>
      )}
      <Row>
        <TransitionGroup component={null}>
          {pokemonList.map((pokemon) => (
            <CSSTransition key={pokemon.id} timeout={300} classNames="pokemon-item">
              <Col xs={6} sm={4} md={3} lg={3} className="mb-4">
                <Card
                  as={Link}
                  to={`/pokemon/${pokemon.id}`}
                  data-bs-theme={theme}
                  className="h-100 text-center shadow-sm pokemon-card"
                >
                  <Card.Img
                    variant="top"
                    src={
                      pokemon.sprites.other['official-artwork'].front_default ||
                      pokemon.sprites.front_default
                    }
                    alt={pokemon.name}
                    className="pokemon-image"
                  />
                  <Card.Body>
                    <Card.Title className="text-center text-capitalize">
                      {formatPokemonName(pokemon.name)}
                    </Card.Title>
                  </Card.Body>
                </Card>
              </Col>
            </CSSTransition>
          ))}
        </TransitionGroup>
      </Row>
    </div>
  );
};

export default PokemonGrid;
