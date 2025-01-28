// src/components/ThemeToggleFixed.js
import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { FaMoon, FaSun } from 'react-icons/fa';
import { ThemeContext } from '../contexts/ThemeContext';
import './ThemeToggleFixed.css';

const ThemeToggleFixed = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <motion.button
      className="theme-toggle-fixed"
      onClick={toggleTheme}
      aria-label="Toggle Dark/Light Mode"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      {theme === 'light' ? <FaMoon /> : <FaSun />}
    </motion.button>
  );
};

export default ThemeToggleFixed;
