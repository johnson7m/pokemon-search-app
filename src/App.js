// src/App.js
import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import CustomNavbar from './components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { ThemeContext } from './contexts/ThemeContext.js';
import AnimatedRoutes from './components/AnimatedRoutes.js';
import ToastPortal from './components/ToastPortal.js';
import useToast from './hooks/useToast.js';


function App() {

  const {
    showToast,
    toastMessage,
    toastVariant,
    setShowToast,
    triggerToast,
  } = useToast();


  useEffect(() => {
    const adjustPadding = () => {
      const navbar = document.querySelector('.navbar');
      const mainContent = document.querySelector('.main-content');
      if (navbar && mainContent) {
        const navbarHeight = navbar.offsetHeight;
        mainContent.style.paddingTop = `${navbarHeight}px`
      }
    };
    adjustPadding();
    window.addEventListener('resize', adjustPadding);
    return () => {
      window.removeEventListener('resize', adjustPadding);
    };
  }, []);


  const {theme} = useContext(ThemeContext);

  return (
    <Router>
      <div className={`main-content app ${theme}`}>
        <CustomNavbar /> 
        <ToastPortal 
          showToast={showToast}
          toastMessage={toastMessage}
          toastVariant={toastVariant}
          setShowToast={setShowToast}
        />
        <AnimatedRoutes xpTrigger={triggerToast} />
      </div>
    </Router>
  );
}

export default App;
