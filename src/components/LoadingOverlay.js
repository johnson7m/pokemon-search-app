// src/components/LoadingOverlay.js
import React, { useContext } from 'react';
import ContentLoader from 'react-content-loader';
import { Spinner } from 'react-bootstrap';
import { ThemeContext } from '../contexts/ThemeContext'; 
import './LoadingOverlay.css';

const LoadingOverlay = ({ type, message }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        {type === 'skeleton' && (
          <ContentLoader
            speed={2}
            width={400}
            height={160}
            viewBox="0 0 400 160"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
          >
            <rect x="0" y="0" rx="5" ry="5" width="400" height="160" />
          </ContentLoader>
        )}

        {type === 'spinner' && (
          <>
            <Spinner
              animation="border"
              // Match the theme or your preference
              variant={theme === 'light' ? 'dark' : 'light'}
            />
            <p className="loading-message">
              {message || 'Loading...'}
            </p>
          </>
        )}

        {type === 'shimmer' && (
          <div className="shimmer"></div>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;
