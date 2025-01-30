// src/pages/HeroPokemonCard.js
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';

const fadeVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const floatAnimation = {
  y: [0, -5, 0],
  transition: {
    duration: 2,
    ease: 'easeInOut',
    repeat: Infinity,
  },
};

const HeroPokemonCard = ({ pokemon, theme }) => {
  if (!pokemon) return null;

  const imgUrl =
    pokemon.sprites?.other?.['official-artwork']?.front_default ||
    pokemon.sprites?.front_default;

  return (
    <motion.div
      className="hero-pokemon-card"
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: 20 }}
      key={pokemon.id}
      aria-label={`Selected Pokémon: ${pokemon.name}`}
    >
      {/* Inner motion.div: infinite float loop */}
      <motion.div animate={floatAnimation}>
        <Card
          className={`shadow-sm border-0 hero-card-${theme}`}
          style={{ cursor: 'default', borderRadius: '1rem' }}
        >
          <Card.Body>
            <Row className="align-items-center">
              <Col xs={12} md={6} className="text-center mb-3">
                <img
                  src={imgUrl}
                  alt={pokemon.name}
                  className="img-fluid"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '0.5rem',
                  }}
                />
              </Col>
              <Col xs={12} md={6}>
                <Card.Title className="text-capitalize">
                  {pokemon.name}
                </Card.Title>
                <p>
                  <strong>ID:</strong> {pokemon.id} {' | '}
                  <strong>Type(s):</strong>{' '}
                  {pokemon.types.map((t) => t.type.name).join(', ')}
                </p>
                <p>
                  <strong>Height:</strong> {pokemon.height}{' '}
                  <strong>Weight:</strong> {pokemon.weight}
                </p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default HeroPokemonCard;
