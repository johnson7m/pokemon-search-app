import React, { createContext, useContext, useState, useCallback } from 'react';

// Create LoadingContext
const LoadingContext = createContext();

// Custom hook for using LoadingContext
export const useLoadingContext = () => useContext(LoadingContext);

// Provider component
export const LoadingProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState({});

  // Start loading for a specific section
  const startLoading = useCallback((section) => {
    setLoadingStates((prev) => ({ ...prev, [section]: true }));
  }, []);

  // Stop loading for a specific section
  const stopLoading = useCallback((section) => {
    setLoadingStates((prev) => ({ ...prev, [section]: false }));
  }, []);

  // Derived global loading state
  const isLoadingGlobally = Object.values(loadingStates).some((state) => state === true);

  return (
    <LoadingContext.Provider
      value={{
        loadingStates,
        isLoadingGlobally,
        startLoading,
        stopLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};
