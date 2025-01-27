// src/App.js
import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import CustomNavbar from './components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ThemeContext } from './contexts/ThemeContext.js';
import AnimatedRoutes from './components/AnimatedRoutes.js';
import ToastPortal from './components/ToastPortal.js';
import { savePokemonToCache, clearCache, getPokemonByIdOrName } from './utils/pokemonCache.js';
import axios from 'axios';
import useScrollPosition from './hooks/useScrollPosition.js';

function App() {
  const { theme } = useContext(ThemeContext);
  const isScrolled = useScrollPosition();

  const precachePopularPokemon = async () => {
    const popularPokemonIds = [1, 4, 7, 25, 150]; // Example IDs for starters and Pikachu/Mewtwo
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
      <div className={`main-content`}>
        <CustomNavbar scrolled={isScrolled} />
        {/* This ToastPortal is now fully controlled by XpProvider (XpContext) */}
        <ToastPortal />
        <AnimatedRoutes />
      </div>
    </Router>    
  );
}




export default App;
