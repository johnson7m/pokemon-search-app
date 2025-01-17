// src/contexts/PokemonContext.js
import React, { createContext, useState, useContext } from 'react';
import { usePageContext } from './PageContext'; // if you want to set 'pokemonDetail' pageState
import { getPokemonByIdOrName } from '../utils/pokemonCache';

const PokemonContext = createContext();

export const PokemonProvider = ({ children }) => {
  const [featuredPokemon, setFeaturedPokemon] = useState(null);

  // Optionally keep "selectedPokemon" for the detail page
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  // If you want to control navigation here, you can:
  const { setPageState } = usePageContext();



  function selectPokemon(partialPokemon) {
    // partialPokemon: { name, id, sprites, types: ['water','flying'] } 
    // or maybe the PokeAPI shape if it's from advanced search
    getPokemonByIdOrName(partialPokemon.id).then((fullData) => {
      setSelectedPokemon(fullData);
      setPageState('pokemonDetail'); 
    });
  }
  return (
    <PokemonContext.Provider
      value={{
        featuredPokemon,
        setFeaturedPokemon,
        selectedPokemon,
        setSelectedPokemon,
        selectPokemon, // optional convenience
      }}
    >
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
