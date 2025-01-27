// src/pages/FancyImagesSection.js
import React from 'react';
import './FancyImagesSection.css';

const FancyImagesSection = () => {
  return (
    <section className="diagonal-images-container">
      {/* Each "diagonal-image" is one slice */}
      <div
        className="diagonal-image"
        style={{ '--bg-image': 'url("/assets/gamified-search.png")' }}
      >
        <div className="diagonal-caption">Gamified Search</div>
      </div>
      <div
        className="diagonal-image"
        style={{ '--bg-image': 'url("/assets/achievements.png")' }}
      >
        <div className="diagonal-caption">Achievements</div>
      </div>
      <div
        className="diagonal-image"
        style={{ '--bg-image': 'url("/assets/leaderboard.png")' }}
      >
        <div className="diagonal-caption">Leaderboards</div>
      </div>
    </section>
  );
};

export default FancyImagesSection;
