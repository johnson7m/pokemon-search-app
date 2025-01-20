import React, { memo } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { AnimatePresence, motion } from 'framer-motion';
import PokemonGridSkeleton from './PokemonGridSkeleton';
import { usePokemonContext } from '../contexts/PokemonContext';
import './PokemonGrid.css'; // For any other styles


const PokemonGridBase = ({ pokemonList, theme, isLoading, onPokemonSelect }) => {

  const { selectPokemon } = usePokemonContext();
  


  if (isLoading && pokemonList.length === 0) {
    return <PokemonGridSkeleton />;
  }

  const formatPokemonName = (name) =>
    name.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div style={{ position: 'relative' }}>
      <Row>
        <AnimatePresence>
          {pokemonList.map((pokemon) => {
            const spriteUrl =
              pokemon?.sprites?.other?.['official-artwork']?.front_default ||
              pokemon?.sprites?.front_default ||
              '';

            return (
                <Col xs={6} sm={4} md={3} lg={3} className="mb-4"
                as={motion.div}
                key={pokemon.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                >
                  <Card
                    onClick={() => {
                      onPokemonSelect?.(pokemon);
                    }}
                    data-bs-theme={theme}
                    className="h-100 text-center shadow-sm pokemon-card"
                  >
                    <Card.Img
                      variant="top"
                      src={spriteUrl}
                      alt={pokemon.name}
                      className="pokemon-image"
                      onError={(e) => {
                        console.warn(`Sprite failed for ${pokemon.name}, using fallback.`);
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
            );
          })}
        </AnimatePresence>
      </Row>
    </div>
  );
};

export const PokemonGrid = memo(PokemonGridBase);
export default PokemonGrid;
