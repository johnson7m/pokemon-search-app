// src/contexts/PokemonContext.js
import React, { createContext, useState, useContext } from 'react';

const PokemonContext = createContext();

export const PokemonProvider = ({ children }) => {
  const [featuredPokemon, setFeaturedPokemon] = useState(null);

  return (
    <PokemonContext.Provider value={{ featuredPokemon, setFeaturedPokemon }}>
      {children}
    </PokemonContext.Provider>
  );
};

export const usePokemonContext = () => {
  const context = useContext(PokemonContext);
  if (!context) {
    throw new Error('usePokemonContext must be used within a PokemonProvider');
  }
  return context;
};
