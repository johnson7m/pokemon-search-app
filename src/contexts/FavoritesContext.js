// src/contexts/FavoritesContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getFavoritePokemon } from '../services/firestoreService';
import { useAuthContext } from './AuthContext';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuthContext();
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadFavorites = async () => {
      if (!user) {
        setFavorites([]);
        setLoadingFavorites(false);
        return;
      }
      try {
        const favs = await getFavoritePokemon();
        if (isMounted) {
          setFavorites(favs);
        }
      } catch (error) {
        console.error('FavoritesContext: Error loading favorites:', error);
      } finally {
        if (isMounted) {
          setLoadingFavorites(false);
        }
      }
    };
    loadFavorites();
    return () => { isMounted = false; };
  }, [user]);

  return (
    <FavoritesContext.Provider value={{ favorites, loadingFavorites, setFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavoritesContext = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavoritesContext must be used within a FavoritesProvider');
  }
  return context;
};
