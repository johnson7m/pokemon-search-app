// src/components/ClearCacheButton.js
import React from 'react';
import { Button, Alert, Container } from 'react-bootstrap';
import { clearPokemonCache } from '../utils/cache';

const ClearCacheButton = () => {
  const handleClearCache = async () => {
    try {
      await clearPokemonCache();
      alert('Cache cleared successfully!');
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Failed to clear cache.');
    }
  };

  return (
    <Container className="mt-3 text-center">
      <Button variant="danger" onClick={handleClearCache}>
        Clear Pokémon Cache
      </Button>
    </Container>
  );
};

export default ClearCacheButton;
