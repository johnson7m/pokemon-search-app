// src/components/Loader.js
import React, { useContext } from 'react';
import { Spinner } from 'react-bootstrap';
import { ThemeContext } from '../contexts/ThemeContext';

const Loader = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className="loader">
      <Spinner animation="border" variant={theme === 'light' ? 'dark' : 'light'} />
    </div>
  );
};

export default Loader;
