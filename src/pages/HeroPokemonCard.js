// src/pages/HeroPokemonCard.js
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

const HeroPokemonCard = ({ pokemon, theme }) => {
  if (!pokemon) return null;

  // Show a sprite or official-artwork
  const imgUrl =
    pokemon.sprites?.other?.['official-artwork']?.front_default ||
    pokemon.sprites?.front_default;

  // Basic stats
  return (
    <motion.div
      className="hero-pokemon-card"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`shadow-sm border-0 hero-card-${theme}`}
        style={{ cursor: 'default' }}
      >
        <Card.Body>
          <Row className="align-items-center">
            <Col xs={12} md={6} className="text-center mb-3">
              <img
                src={imgUrl}
                alt={pokemon.name}
                className="img-fluid"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </Col>
            <Col xs={12} md={6}>
              <Card.Title className="text-capitalize">{pokemon.name}</Card.Title>
              <p>
                <strong>ID:</strong> {pokemon.id}
                {' | '}
                <strong>Type(s):</strong>{' '}
                {pokemon.types.map((t) => t.type.name).join(', ')}
              </p>
              <p>
                <strong>Height:</strong> {pokemon.height}{' '}
                <strong>Weight:</strong> {pokemon.weight}
              </p>
              {/* More minimal details if you want */}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default HeroPokemonCard;
