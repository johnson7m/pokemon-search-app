import React, { useEffect, useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Container } from 'react-bootstrap';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import './Hero.css';
import { ThemeContext } from '../contexts/ThemeContext';
import { useAuthContext } from '../contexts/AuthContext';


const Hero = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { user } = useAuthContext();


  useEffect(() => {
      if (user) {
        navigate('/home');
      }
  }, [user, navigate]);

  const handleBeginSearch = () => {
    navigate('/home');
  };


  return (
    <div className='heropage'>    
      <Container className="d-flex flex-column align-items-center justify-content-center vh-100">
        <motion.h1
          className="main-title"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Pokémon Search Index
        </motion.h1>
        <motion.h2
          className="sub-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          An Aether Application
        </motion.h2>
        <motion.div
          className="cta-button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <Button
            variant={theme === 'light' ? 'dark' : 'light'}
            size="lg"
            onClick={handleBeginSearch}
            className="mt-4"
          >
            Begin your search here
          </Button>
        </motion.div>
      </Container>
      <footer className="footer text-center">
        <p>© 2024 Matthew C. Johnson. All Rights Reserved.</p>
        <div className="social-links">
          <a
            href="https://github.com/johnson7m"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <FaGithub size={30} />
          </a>
          <a
            href="https://linkedin.com/in/matthew-johnson-59070628b"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <FaLinkedin size={30} />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Hero;