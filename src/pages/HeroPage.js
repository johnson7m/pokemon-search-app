// src/pages/HeroPage.js
import React, { useContext } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { ThemeContext } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import './HeroPage.css'; // For custom styles
import { FaChevronDown } from 'react-icons/fa';

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const Hero = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`hero-page bg-${theme}`} data-bs-theme={theme}>
      {/* 
        1) Hero Section with Parallax 
           + Optional background video snippet (commented out) 
      */}
      <section className="hero-banner d-flex align-items-center justify-content-center position-relative">
        
        {/*
          <!--
            Uncomment the video background below and replace "your-video.mp4" 
            with your own video path or URL to activate a background video. 
            
            <video autoPlay muted loop playsInline className="hero-bg-video">
              <source src="/assets/your-video.mp4" type="video/mp4" />
            </video>
          -->
        */}

        <Container>
          <Row className="align-items-center">
            <Col md={{ span: 8, offset: 2 }} className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-4 hero-title"
              >
                Welcome to the Pokémon Search Index
              </motion.h1>

              {/* Reskinned SearchBar in the Hero */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="hero-searchbar"
              >
                <SearchBar />
              </motion.div>

              {/* Scroll-down / Learn More button */}
              <motion.div
                className="scroll-down"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
              >
                {/* 
                  Anchor link to #features 
                  (the next main section in this page)
                */}
                <a href="#features" className="scroll-down-link">
                  <FaChevronDown size={32} />
                  <span className="ms-2">Learn More</span>
                </a>
              </motion.div>
            </Col>
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
                Level up your trainer profile as you explore Pokémon data, collect favorites, and
                unlock achievements. Compete on global leaderboards to become the top Pokémon
                Master!
              </p>
            </Col>
            <Col md={6}>
              {/* You can display an image or an illustration here */}
              <img
                src="/assets/gamified-search.png"
                alt="Gamified Search"
                className="img-fluid rounded"
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
          className="py-5 bg-light"
        >
          <Row className="align-items-center">
            <Col md={{ span: 6, order: 2 }}>
              <h2>Advanced Features & Achievements</h2>
              <p>
                Use our advanced search to filter by type, region, evolution stage, and more. Unlock
                unique badges and achievements as you discover rare Pokémon!
              </p>
            </Col>
            <Col md={{ span: 6, order: 1 }}>
              <img
                src="/assets/achievements.png"
                alt="Achievements"
                className="img-fluid rounded"
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
                Track your progress, earn XP, and see how you rank against other trainers. Save
                Pokémon to your personal favorites list for quick access.
              </p>
            </Col>
            <Col md={6}>
              <img
                src="/assets/leaderboard.png"
                alt="Leaderboards"
                className="img-fluid rounded"
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
            <Button
              as={Link}
              to="/signup"
              variant={theme === 'light' ? 'dark' : 'light'}
              size="lg"
            >
              Sign Up Now
            </Button>
          </motion.div>
        </Container>
      </section>
    </div>
  );
};

export default Hero;
