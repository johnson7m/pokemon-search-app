// src/hooks/useScrollPosition.js
import { useState, useEffect } from 'react';

const useScrollPosition = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY =
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop;
      setIsScrolled(scrollY > 0);
      
      // Debugging logs
      //console.log('Scroll position:', scrollY, 'Is scrolled:', scrollY > 0);
    };

    // Initial check in case the user is not at the top
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return isScrolled;
};

export default useScrollPosition;
