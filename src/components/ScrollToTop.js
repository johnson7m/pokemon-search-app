// src/components/ScrollToTop.js
import { useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { usePageContext } from '../contexts/PageContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const { pageState } = usePageContext();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, pageState]);

  return null;
};

export default ScrollToTop;
