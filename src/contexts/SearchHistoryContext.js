// src/contexts/SearchHistoryContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSearchHistory } from '../services/firestoreService';
import { useAuthContext } from './AuthContext';

const SearchHistoryContext = createContext();

export const SearchHistoryProvider = ({ children }) => {
  const { user } = useAuthContext();
  const [searchHistory, setSearchHistory] = useState([]);
  const [loadingSearchHistory, setLoadingSearchHistory] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadSearchHistory = async () => {
      if (!user) {
        setSearchHistory([]);
        setLoadingSearchHistory(false);
        return;
      }
      try {
        const history = await getSearchHistory();
        if (isMounted) {
          setSearchHistory(history);
        }
      } catch (error) {
        console.error('SearchHistoryContext: Error loading search history:', error);
      } finally {
        if (isMounted) {
          setLoadingSearchHistory(false);
        }
      }
    };
    loadSearchHistory();
    return () => { isMounted = false; };
  }, [user]);

  return (
    <SearchHistoryContext.Provider value={{ searchHistory, loadingSearchHistory, setSearchHistory }}>
      {children}
    </SearchHistoryContext.Provider>
  );
};

export const useSearchHistoryContext = () => {
  const context = useContext(SearchHistoryContext);
  if (!context) {
    throw new Error('useSearchHistoryContext must be used within a SearchHistoryProvider');
  }
  return context;
};
