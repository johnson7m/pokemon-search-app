// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
// Use your custom loading overlay
import LoadingOverlay from '../components/LoadingOverlay';
// Or if you prefer the simpler Loader, import that instead:
// import Loader from '../components/Loader';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    // Subscribe to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    // Instead of plain text "Loading...", show your loading overlay
    return <LoadingOverlay type="spinner" />;
    // Or, if you want a simpler approach:
    // return <Loader />;
  }

  // When not loading, provide user to the rest of the app
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to consume AuthContext easily.
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
