// src/contexts/ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check local storage for theme preference
  const storedTheme = localStorage.getItem('theme') || 'light';

  // (Optional) Check local storage for accessibility mode
  const storedAccessibility = localStorage.getItem('accessibilityMode') === 'true';

  const [theme, setTheme] = useState(storedTheme);
  const [accessibilityMode, setAccessibilityMode] = useState(storedAccessibility);

  // Update local storage & body classes whenever theme or accessibility changes
  useEffect(() => {
    // Save theme
    localStorage.setItem('theme', theme);

    // Remove old theme classes
    document.body.classList.remove('light', 'dark');
    // Add new theme class
    document.body.classList.add(theme);

    // If you want a custom gradient or styling for the "light" theme:
    // - You can also do dynamic styling or class toggles here
  }, [theme]);

  useEffect(() => {
    // Persist accessibility mode if desired
    localStorage.setItem('accessibilityMode', accessibilityMode ? 'true' : 'false');

    if (accessibilityMode) {
      document.body.classList.add('accessibility-mode');
    } else {
      document.body.classList.remove('accessibility-mode');
    }
  }, [accessibilityMode]);


  

  // Toggle between 'light' and 'dark'
  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  };

  // Toggle accessibility mode
  const toggleAccessibilityMode = () => {
    setAccessibilityMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        accessibilityMode,
        toggleAccessibilityMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
