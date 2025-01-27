// src/pages/HeroPage.js
import React, { useContext, useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../contexts/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';
import SearchBar from '../components/SearchBar';
import HeroPokemonCard from './HeroPokemonCard';
import './HeroPage.css';
import { useAuthContext } from '../contexts/AuthContext';
import FancyImagesSection from '../components/FancyImagesSection';

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const headingVariants = {
  initial: { opacity: 0, y: -50 },
  animate: { opacity: 1, y: 0 },
};

const Hero = () => {
  const { theme } = useContext(ThemeContext);
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [heroSelectedPokemon, setHeroSelectedPokemon] = useState(null);

  useEffect(() => {
    if (user) {
      // If user is logged in, redirect away from hero to /home
      navigate('/home');
    }
  }, [user, navigate]);

  const handlePokemonSelect = (pokemon) => {
    setHeroSelectedPokemon(pokemon);
  };

  return (
    <div className={`hero-page bg-${theme}`} data-bs-theme={theme}>
      {/* Hero Banner */}
      <section className="hero-banner position-relative d-flex align-items-center">
        <Container>
          <Row className="text-center">
            <Col>
              <motion.h1
                initial="initial"
                animate="animate"
                variants={headingVariants}
                transition={{ duration: 0.8 }}
                className="mb-4 hero-title"
              >
                Welcome to the Pokémon Search Index
              </motion.h1>
            </Col>
          </Row>

          {/* Row for side-by-side search + selected Pokémon */}
          <Row className="align-items-start mt-4">
            <Col xs={12} md={6} className="mb-3">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="hero-searchbar"
              >
                <SearchBar onPokemonSelect={handlePokemonSelect} />
              </motion.div>
            </Col>

            <Col xs={12} md={6} className="mb-3">
              <AnimatePresence mode="wait">
                {heroSelectedPokemon && (
                  <HeroPokemonCard
                    key={heroSelectedPokemon.id}
                    pokemon={heroSelectedPokemon}
                    theme={theme}
                  />
                )}
              </AnimatePresence>
            </Col>
          </Row>

          {/* Scroll-down link */}
          <Row className="text-center">
            <motion.div
              className="scroll-down"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <a href="#features" className="scroll-down-link">
                <FaChevronDown size={32} />
                <span className="ms-2">Learn More</span>
              </a>
            </motion.div>
          </Row>
        </Container>
      </section>

      {/* Overview / Feature Sections */}
      <Container id="features" className="feature-sections">
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
          transition={{ duration: 0.5 }}
          className="py-5"
        >
          <Row className="align-items-center">
            <Col md={6}>
              <h2>Gamified Pokémon Search</h2>
              <p>
                Level up your trainer profile as you explore Pokémon data, collect favorites, 
                and unlock achievements. Compete on global leaderboards to become the top 
                Pokémon Master!
              </p>
            </Col>
            <Col md={6}>
              {/* FancyImagesSection #1 with default props */}
              <FancyImagesSection
                images={[
                  { src: '/assets/home_new_trainer.png', caption: 'Gamified Search' },
                  { src: '/assets/dashboard_progress.png', caption: 'Achievements' },
                  { src: '/assets/dashboard_leaderboard.png', caption: 'Leaderboards' },
                ]}
                containerHeight="150px"
                topRadius='2rem'
              />
            </Col>
          </Row>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="py-5"
        >
          <Row className="align-items-center">
            <Col md={{ span: 6, order: 2 }}>
              <h2>Advanced Features & Achievements</h2>
              <p>
                Use our advanced search to filter by type, region, evolution stage, and more. 
                Unlock unique badges and achievements as you discover rare Pokémon!
              </p>
            </Col>
            <Col md={{ span: 6, order: 1 }}>
              {/* FancyImagesSection #2 with partial pill shape + custom angles */}
              <FancyImagesSection
                images={[
                  { src: '/assets/home_new_trainer.png', caption: 'Search Flow' },
                  { src: '/assets/dashboard_progress.png', caption: 'Stats & Progress' },
                  { src: '/assets/dashboard_leaderboard.png', caption: 'Community Ranks' },
                ]}
                containerHeight='150px'
                topRadius='2rem'
              />
            </Col>
          </Row>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="py-5"
        >
          <Row className="align-items-center">
            <Col md={6}>
              <h2>Global Leaderboards & Favorites</h2>
              <p>
                Track your progress, earn XP, and see how you rank against other trainers. 
                Save Pokémon to your personal favorites list for quick access.
              </p>
            </Col>
            <Col md={6}>
              {/* FancyImagesSection #3 with a bigger pill shape and different angles */}
              <FancyImagesSection
                images={[
                  { src: '/assets/home_new_trainer.png', caption: 'Welcome' },
                  { src: '/assets/dashboard_progress.png', caption: 'Track Progress' },
                  { src: '/assets/dashboard_leaderboard.png', caption: 'Climb Leaderboards' },
                ]}
                containerHeight='150px'
                topRadius='2rem'
              />
            </Col>
          </Row>
        </motion.section>
      </Container>

      {/* Final CTA Section */}
      <section className="cta-section text-center py-5">
        <Container>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-4">Ready to Get Started?</h2>
            <p className="mb-4">
              Create an account to join the fun, track your progress, and become the ultimate 
              Pokémon trainer.
            </p>

            {/* Sign Up button */}
            <Button
              as={Link}
              to="/signup"
              variant={theme === 'light' ? 'dark' : 'light'}
              size="lg"
              className="me-3"
            >
              Sign Up Now
            </Button>

            {/* Already have an account? Link to login */}
            <Button
              as={Link}
              to="/login"
              variant={theme === 'light' ? 'outline-dark' : 'outline-light'}
              size="lg"
            >
              Log In
            </Button>
          </motion.div>
        </Container>
      </section>
    </div>
  );
};

export default Hero;
