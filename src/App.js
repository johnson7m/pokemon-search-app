// src/App.js
import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import CustomNavbar from './components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ThemeContext } from './contexts/ThemeContext.js';
import AnimatedRoutes from './components/AnimatedRoutes.js';
import ToastPortal from './components/ToastPortal.js';
import { savePokemonToCache, clearCache, getPokemonByIdOrName } from './utils/pokemonCache.js';
import axios from 'axios';
import useScrollPosition from './hooks/useScrollPosition.js';
import './App.css';
import ScrollToTop from './components/ScrollToTop.js';

function App() {
  const { theme } = useContext(ThemeContext);
  const isScrolled = useScrollPosition();

  // Example popular Pokémon caching
  const precachePopularPokemon = async () => {
    const popularPokemonIds = [1, 4, 7, 25, 150]; // Example IDs
    const promises = popularPokemonIds.map(async (id) => {
      const cachedPokemon = await getPokemonByIdOrName(id);
      if (!cachedPokemon) {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
        savePokemonToCache(response.data);
      }
    });
    await Promise.all(promises);
  };

  useEffect(() => {
    precachePopularPokemon();
  }, []);

  return (
    <Router>
      {/* role="main" for primary content region */}
      <div className={`main-content app-${theme}`} role="main">
        <CustomNavbar scrolled={isScrolled} />
        {/* This ToastPortal is fully controlled by XpProvider (XpContext) */}
        <ToastPortal />
        <AnimatedRoutes />
        <ScrollToTop/>
      </div>
    </Router>
  );
}

export default App;
