// src/contexts/PageContext.js
import React, { createContext, useState, useContext } from 'react';

// Create context
const PageContext = createContext();

// Provider component
export const PageProvider = ({ children }) => {
  const [pageState, setPageState] = useState('home'); // Default page is 'home'

  return (
    <PageContext.Provider value={{ pageState, setPageState }}>
      {children}
    </PageContext.Provider>
  );
};

// Custom hook to use the context
export const usePageContext = () => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePageContext must be used within a PageProvider');
  }
  return context;
};
