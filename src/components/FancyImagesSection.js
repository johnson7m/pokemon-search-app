// src/pages/FancyImagesSection.js
import React from 'react';
import PropTypes from 'prop-types';
import './FancyImagesSection.css';

const FancyImagesSection = ({ images }) => {
  return (
    <section className="diagonal-images-container">
      {images.map((item, index) => (
        <div
          key={index}
          className="diagonal-image"
          style={{ '--bg-image': `url("${item.src}")` }}
        >
          <div className="diagonal-caption">{item.caption}</div>
        </div>
      ))}
    </section>
  );
};

FancyImagesSection.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      src: PropTypes.string.isRequired,    // path to image
      caption: PropTypes.string.isRequired // text to display
    })
  ).isRequired
};

export default FancyImagesSection;
