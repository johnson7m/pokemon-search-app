// src/hooks/useOverlayVisibility.js
import { useState, useEffect } from 'react';

export default function useOverlayVisibility() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const scrollY = window.scrollY;
      // Show the button after scrolling down 300px
      setIsVisible(scrollY > 300);
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return { isVisible };
}
