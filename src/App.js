// src/App.js
import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import CustomNavbar from './components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ThemeContext } from './contexts/ThemeContext.js';
import AnimatedRoutes from './components/AnimatedRoutes.js';
import ToastPortal from './components/ToastPortal.js';

function App() {
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const adjustPadding = () => {
      const navbar = document.querySelector('.navbar');
      const mainContent = document.querySelector('.main-content');
      if (navbar && mainContent) {
        const navbarHeight = navbar.offsetHeight;
        mainContent.style.paddingTop = `${navbarHeight}px`;
      }
    };
    adjustPadding();
    window.addEventListener('resize', adjustPadding);
    return () => {
      window.removeEventListener('resize', adjustPadding);
    };
  }, []);

  return (
    <Router>
      <div className={`main-content app ${theme}`}>
        <CustomNavbar />
        {/* This ToastPortal is now fully controlled by XpProvider (XpContext) */}
        <ToastPortal />
        <AnimatedRoutes />
      </div>
    </Router>
  );
}

export default App;
