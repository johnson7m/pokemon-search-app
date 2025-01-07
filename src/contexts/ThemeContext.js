// src/contexts/ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check local storage for theme preference
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Update local storage whenever theme changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
  }, [theme]);

  // Toggle between 'light' and 'dark' themes
  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
