// src/pages/MainHomePage.js
import React, { useContext } from 'react';
import { Container } from 'react-bootstrap';
import { ThemeContext } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '../components/SearchBar';
import Home from './Home';
import Dashboard from './Dashboard';
import "./MainHomePage.css";
import { usePageContext } from '../contexts/PageContext';
import { PokemonProvider } from '../contexts/PokemonContext';
import FeaturedPokemon from '../components/FeaturedPokemon';

const variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const MainHomePage = () => {
  const { theme } = useContext(ThemeContext);
  const { pageState } = usePageContext();

  const renderSelectedContent = () => {
    switch (pageState) {
      case 'home':
        return <Home key="home" />;
      case 'dashboard':
        return <Dashboard key="dashboard" />;
      case 'pokemon':
        return <FeaturedPokemon section="mainFeaturedPokemon" key="pokemon" />;
      default:
        return <Home key="home" />;
    }
  };

  return (
    <PokemonProvider>
      <Container data-bs-theme={theme} className="mt-5">
        {/* Persistent Search */}
        <SearchBar />

        {/* AnimatePresence handles mounting and unmounting animations */}
        <AnimatePresence mode="wait">
          <motion.div
            key={pageState}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.1 }}
          >
            {renderSelectedContent()}
          </motion.div>
        </AnimatePresence>
      </Container>
    </PokemonProvider>
  );
};

export default MainHomePage;
