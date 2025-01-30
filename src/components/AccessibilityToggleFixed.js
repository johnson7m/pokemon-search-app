// src/components/AccessibilityToggleFixed.js
import React, { useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUniversalAccess } from 'react-icons/fa'; // or FaKeyboard, FaWheelchair, etc.
import { ThemeContext } from '../contexts/ThemeContext';
import './AccessibilityToggleFixed.css';

const AccessibilityToggleFixed = () => {
  const { accessibilityMode, toggleAccessibilityMode } = useContext(ThemeContext);



  return (
    <motion.button
      className="accessibility-toggle-fixed"
      onClick={toggleAccessibilityMode}
      aria-label="Toggle Accessibility Mode"
      aria-pressed={accessibilityMode}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <FaUniversalAccess />
    </motion.button>
  );
};

export default AccessibilityToggleFixed;
