import React, { useState, useEffect } from 'react';
import { Carousel, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './PokemonCarousel.css';

const PokemonCarousel = ({ pokemonList, theme, dashboardMode= false}) => {
  const slides = [];
  const [chunkSize, setChunkSize] = useState(3); // Default to 3 cards per slide

  useEffect(() => {
    const updateChunkSize = () => {
      if (window.innerWidth < 576) {
        setChunkSize(1);
      } else if (window.innerWidth < 768) {
        setChunkSize(2);
      } else {
        setChunkSize(dashboardMode ? 2 : 3);
      }
    };

    window.addEventListener('resize', updateChunkSize);
    updateChunkSize(); // Initial check

    return () => window.removeEventListener('resize', updateChunkSize);
  }, [dashboardMode]);

  for (let i = 0; i < pokemonList.length; i += chunkSize) {
    const chunk = pokemonList.slice(i, i + chunkSize);
    slides.push(chunk);
  }

  return (
    <Carousel indicators={false}>
      {slides.map((slide, index) => (
        <Carousel.Item key={index}>
          <Row className="justify-content-center">
            {slide.map((pokemon) => (
              <Col xs={12} sm={6} md={dashboardMode ? 6 : 4} lg={dashboardMode ? 6 : 4} key={pokemon.id}>
                <Card
                  data-bs-theme={theme === 'light' ? 'light' : 'dark'}
                  className="mb-3 text-center"
                >
                  <Card.Img
                    variant="top"
                    src={pokemon.sprites.front_default}
                    alt={pokemon.name}
                    className="mx-auto"
                    style={{ width: '150px' }}
                  />
                  <Card.Body>
                    <Card.Title className="text-capitalize">
                      {pokemon.name}
                    </Card.Title>
                    <Button
                      as={Link}
                      to={`/pokemon/${pokemon.id}`}
                      variant="secondary"
                    >
                      View Details
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default PokemonCarousel;