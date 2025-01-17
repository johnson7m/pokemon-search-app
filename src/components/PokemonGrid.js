// src/components/PokemonGrid.js
import React, { memo } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import PokemonGridSkeleton from './PokemonGridSkeleton';
import './PokemonGrid.css';

const PokemonGridBase = ({ pokemonList, theme, isLoading }) => {
  console.log('[PokemonGrid] Rendering with:', {
    isLoading,
    pokemonListLength: pokemonList.length,
    theme,
  });

  if (isLoading && pokemonList.length === 0) {
    console.log('[PokemonGrid] Showing skeleton because isLoading + empty list.');
    return <PokemonGridSkeleton />;
  }

  const formatPokemonName = (name) =>
    name.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div style={{ position: 'relative' }}>

      <Row>
        <TransitionGroup component={null}>
          {pokemonList.map((pokemon) => {
            const spriteUrl =
              pokemon?.sprites?.other?.['official-artwork']?.front_default ||
              pokemon?.sprites?.front_default ||
              '';

            console.log(
              `[PokemonGrid] Pokemon ID ${pokemon.id}, Name: ${pokemon.name}`,
              pokemon
            );

            return (
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
                      src={spriteUrl}
                      alt={pokemon.name}
                      className="pokemon-image"
                      onError={(e) => {
                        console.warn(
                          `[PokemonGrid] Sprite failed for "${pokemon.name}". Using fallback.`
                        );
                        e.currentTarget.src = '/fallback-pokemon.png';
                      }}
                    />
                    <Card.Body>
                      <Card.Title className="text-center text-capitalize">
                        {formatPokemonName(pokemon.name)}
                      </Card.Title>
                    </Card.Body>
                  </Card>
                </Col>
              </CSSTransition>
            );
          })}
        </TransitionGroup>
      </Row>
    </div>
  );
};

// Wrap in React.memo, so it only re-renders if pokemonList or props changed
export const PokemonGrid = memo(PokemonGridBase);

export default PokemonGrid;
