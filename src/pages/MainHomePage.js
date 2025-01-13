import React, { useContext } from 'react';
import { Container } from 'react-bootstrap';
import { ThemeContext } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import SearchBar from '../components/SearchBar';
import Home from './Home';
import Dashboard from './Dashboard';
import PokemonDetailPage from './PokemonDetailPage'
import "./MainHomePage.css";
import { usePageContext } from '../contexts/PageContext';
import { PokemonProvider } from '../contexts/PokemonContext';
import FeaturedPokemon from '../components/FeaturedPokemon';

const MainHomePage = () => {
  const { theme } = useContext(ThemeContext);
  const { pageState, setPageState } = usePageContext();


  const renderSelectedContent = () => {
    switch (pageState) {
      case 'home':
        return <Home />;
      case 'dashboard':
        return <Dashboard />;
      case 'pokemon':
        return <FeaturedPokemon />;
      default:
        return <Home />;
    }
  };



  return (
    <PokemonProvider>
      <Container data-bs-theme={theme} className="mt-5">
        {/* Persistent Search */}
        <SearchBar />

        {/* Render selected content */}
        <motion.div 
        className="mt-4"
        initial={{ opacity: 0, y: 20}}
        animate={{ opacity: 1, y:0 }}
        exit={{ opacity: 0, y: -20}}
        transition={{ duration: 0.3}}
        >
          {renderSelectedContent()}
        </motion.div>
      </Container>
    </PokemonProvider>
  );
};

export default MainHomePage;