// src/pages/HeroPage.js
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeContext } from '../contexts/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';
import { useAuthContext } from '../contexts/AuthContext';
import SearchBar from '../components/SearchBar';
import HeroPokemonCard from './HeroPokemonCard';
import FancyImagesSection from '../components/FancyImagesSection';
import BackToTopButton from '../components/BackToTopButton'; // Import the new component
import ThemeToggleFixed from '../components/ThemeToggleFixed';

import useOverlayVisibility from '../hooks/useOverlayVisibility';

import './HeroPage.css';

// Framer Motion variants for container animations
const containerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.8,
      when: "beforeChildren",
      staggerChildren: 0.3
    },
  },
};

// Framer Motion variants for heading animations
const headingVariants = {
  hidden: { opacity: 0, y: -40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.8,
      ease: 'easeOut'
    },
  },
};

// Framer Motion variants for subheadings and paragraphs
const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  },
};


const Hero = () => {
  const { theme } = useContext(ThemeContext);
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [heroSelectedPokemon, setHeroSelectedPokemon] = useState(null);
 
  // Overlays logic (show/hide top & bottom)
  const { isVisible } = useOverlayVisibility();

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handlePokemonSelect = (pokemon) => {
    setHeroSelectedPokemon(pokemon);
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

 
  return (
    <div className={`hero-page bg-${theme}`} data-bs-theme={theme}>
      {/* Back to Top Button */}
      <BackToTopButton isVisible={isVisible} onClick={scrollToTop} />

      {!user && <ThemeToggleFixed />}

      {/* HERO BANNER - 100vh, center content */}
      <section className="hero-banner d-flex align-items-center justify-content-center position-relative">
        <Container className="text-center position-relative z-2">
          <motion.h1
            variants={headingVariants}
            initial="hidden"
            animate="visible"
            className="hero-title display-3 mb-4"
          >
            Welcome to the Pokémon Search Index
          </motion.h1>

          <motion.div
            className="w-75 mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Row className="align-items-start">
              <Col xs={12} md={6} className="mb-3 hero-searchbar-col">
                <motion.div variants={textVariants}>
                  <SearchBar onPokemonSelect={handlePokemonSelect} />
                </motion.div>
              </Col>
              <Col xs={12} md={6} className="mb-3 hero-card-col">
                <AnimatePresence mode="wait">
                  {heroSelectedPokemon && (
                    <motion.div
                      variants={textVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      <HeroPokemonCard
                        key={heroSelectedPokemon.id}
                        pokemon={heroSelectedPokemon}
                        theme={theme}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Col>
            </Row>
          </motion.div>

          <motion.div
            className="enhanced-chevron text-center mt-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <a href="#features" className="scroll-down-link">
              <FaChevronDown className="bouncy-chevron" size={32} />
              <span className="ms-2">Dive Deeper</span>
            </a>
          </motion.div>
        </Container>
      </section>

      {/* FEATURE SECTIONS */}
      <motion.section
        id="features"
        className="feature-section d-flex align-items-center justify-content-center"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="mb-4">
              <motion.h2
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="display-4"
              >
                Gamified Pokémon Search
              </motion.h2>
              <motion.p
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="lead"
              >
                Level up your trainer profile as you explore Pokémon data...
              </motion.p>
            </Col>
            <Col md={6}>
              <FancyImagesSection
                images={[
                  { src: '/assets/home_new_trainer.png', caption: 'Gamified Search' },
                  { src: '/assets/dashboard_progress.png', caption: 'Achievements' },
                  { src: '/assets/dashboard_leaderboard.png', caption: 'Leaderboards' },
                ]}
                containerHeight="350px"
                topRadius="2rem"
              />
            </Col>
          </Row>
        </Container>
      </motion.section>

      {/* Another full-viewport feature */}
      <motion.section
        className="feature-section d-flex align-items-center justify-content-center"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        <Container>
          <Row className="align-items-center">
            <Col md={{ span: 6, order: 2 }} className="mb-4">
              <motion.h2
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="display-4"
              >
                Advanced Features & Achievements
              </motion.h2>
              <motion.p
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="lead"
              >
                Use our advanced search to filter by type, region, evolution stage...
              </motion.p>
            </Col>
            <Col md={{ span: 6, order: 1 }}>
              <FancyImagesSection
                images={[
                  { src: '/assets/home_new_trainer.png', caption: 'Search Flow' },
                  { src: '/assets/dashboard_progress.png', caption: 'Stats & Progress' },
                  { src: '/assets/dashboard_leaderboard.png', caption: 'Community Ranks' },
                ]}
                containerHeight="350px"
                topRadius="2rem"
              />
            </Col>
          </Row>
        </Container>
      </motion.section>

      {/* Third feature... */}
      <motion.section
        className="feature-section d-flex align-items-center justify-content-center"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="mb-4">
              <motion.h2
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="display-4"
              >
                Global Leaderboards & Favorites
              </motion.h2>
              <motion.p
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="lead"
              >
                Track your progress, earn XP, and see how you rank...
              </motion.p>
            </Col>
            <Col md={6}>
              <FancyImagesSection
                images={[
                  { src: '/assets/home_new_trainer.png', caption: 'Welcome' },
                  { src: '/assets/dashboard_progress.png', caption: 'Track Progress' },
                  { src: '/assets/dashboard_leaderboard.png', caption: 'Climb Leaderboards' },
                ]}
                containerHeight="350px"
                topRadius="2rem"
              />
            </Col>
          </Row>
        </Container>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="cta-section d-flex align-items-center justify-content-center text-center"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        <Container>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="cta-content"
          >
            <motion.h2
              variants={textVariants}
              initial="hidden"
              animate="visible"
              className="mb-4 display-4"
            >
              Ready to Get Started?
            </motion.h2>
            <motion.p
              variants={textVariants}
              initial="hidden"
              animate="visible"
              className="lead mb-4"
            >
              Create an account to join the fun, track your progress...
            </motion.p>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="cta-buttons"
            >
              <Button
                as={Link}
                to="/signup"
                variant={theme === 'light' ? 'dark' : 'light'}
                size="lg"
                className="me-3"
              >
                Sign Up Now
              </Button>
              <Button
                as={Link}
                to="/login"
                variant={theme === 'light' ? 'outline-dark' : 'outline-light'}
                size="lg"
              >
                Log In
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </motion.section>
    </div>
  );
};

export default Hero;
