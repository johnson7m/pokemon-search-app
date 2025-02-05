// src/pages/MainHomePage.js
import React, { useContext, useState } from 'react';
import { Container } from 'react-bootstrap';
import { ThemeContext } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '../components/SearchBar';
import Home from './Home';
import Dashboard from './Dashboard';
import './MainHomePage.css';
import { usePageContext } from '../contexts/PageContext';
import { PokemonProvider } from '../contexts/PokemonContext';
import FeaturedPokemon from '../components/FeaturedPokemon';
import PokemonDetailPage from './PokemonDetailPage';
import { useAuthContext } from '../contexts/AuthContext';
import TasksToggleFixed from '../components/TasksToggleFixed';
import TasksOverlay from '../components/TasksOverlay';

const MainHomePage = () => {
  const { theme } = useContext(ThemeContext);
  const { pageState } = usePageContext();
  const { user } = useAuthContext();
  const [showTasksOverlay, setShowTasksOverlay] = useState(false);

  const handleToggleTasks = () => {
    setShowTasksOverlay((prev) => !prev);
  };

  const closeOverlay = () => {
    setShowTasksOverlay(false);
  };

  const renderSelectedContent = () => {
    switch (pageState) {
      case 'home':
        return <Home key="home" />;
      case 'dashboard':
        return <Dashboard key="dashboard" />;
      case 'pokemon':
        return <FeaturedPokemon section="mainFeaturedPokemon" key="pokemon" />;
      case 'pokemonDetail':
        return <PokemonDetailPage key="pokemonDetail" />;
      default:
        return <Home key="home" />;
    }
  };

  return (
    <PokemonProvider>
      <Container data-bs-theme={theme} className={`mt-5 main-homepage-container`} role="main">
        <h1 tabIndex="0">
          {user
            ? `Welcome back, ${user.displayName || 'Trainer'}!`
            : 'Welcome to the Pokémon Search Index'}
        </h1>

        {/* Persistent Search */}
        <SearchBar />

        {/* Task Toggle Button */}
        <TasksToggleFixed onToggle={handleToggleTasks}/>

        {/* The overlay that appears */}
        <AnimatePresence>
          {showTasksOverlay && (
            <TasksOverlay show={showTasksOverlay} onClose={closeOverlay} />
          )}
        </AnimatePresence>        

        {/* AnimatePresence handles mounting and unmounting animations */}
        <AnimatePresence mode="wait">
            {renderSelectedContent()}
        </AnimatePresence>
      </Container>
    </PokemonProvider>
  );
};

export default MainHomePage;
