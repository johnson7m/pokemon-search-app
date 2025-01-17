// src/components/PokemonCarousel.js
import React, { useState, useEffect } from 'react';
import { Carousel, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './PokemonCarousel.css';
import { usePokemonContext } from '../contexts/PokemonContext';
import { usePageContext } from '../contexts/PageContext';

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const PokemonCarousel = ({ pokemonList, theme, dashboardMode = false }) => {
  const { selectPokemon } = usePokemonContext();
  const [chunkSize, setChunkSize] = useState(3); // Default to 3 cards per slide
  const [isLoading, setIsLoading] = useState(true);
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    const updateChunkSize = () => {
      let size;
      if (window.innerWidth < 576) {
        size = 1;
      } else if (window.innerWidth < 768) {
        size = 2;
      } else {
        size = dashboardMode ? 2 : 3;
      }
      setChunkSize(size);

      // Update slides based on new chunk size
      const newSlides = [];
      for (let i = 0; i < pokemonList.length; i += size) {
        const chunk = pokemonList.slice(i, i + size);
        newSlides.push(chunk);
      }
      setSlides(newSlides);
      setIsLoading(false);
    };

    updateChunkSize();
    window.addEventListener('resize', updateChunkSize);

    return () => {
      window.removeEventListener('resize', updateChunkSize);
    };
  }, [dashboardMode, pokemonList]);


  if (pokemonList.length === 0) {
    return <p>No Pokémon available to display.</p>;
  }


  return (
    <Carousel indicators={false}>
      {slides.map((slide, index) => (
        <Carousel.Item key={index}>
          <Row className="justify-content-center">
            {slide.map((pokemon) => (
              <Col xs={12} sm={6} md={dashboardMode ? 6 : 4} lg={dashboardMode ? 6 : 4} key={pokemon.id}>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  <Card
                    data-bs-theme={theme === 'light' ? 'light' : 'dark'}
                    className="mb-3 text-center"
                  >
                    <Card.Img
                      variant="top"
                      onClick={() => {
                        selectPokemon(pokemon);
                        console.log('Pokemon data:', pokemon);

                      }}
                      src={pokemon.sprites.front_default}
                      alt={pokemon.name}
                      className="mx-auto"
                      style={{ width: '150px' }}
                    />
                    <Card.Body>
                      <Card.Title className="text-capitalize">
                        {pokemon.name}
                      </Card.Title>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default PokemonCarousel;
