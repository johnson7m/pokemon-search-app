// src/components/FancyImagesSection.js
import React from 'react';
import PropTypes from 'prop-types';
import './FancyImagesSection.css';

const FancyImagesSection = ({
  images,
  containerHeight,
  topRadius,
  styleVariant,
}) => {
  return (
    <div
      className={`fancy-images-container ${styleVariant}`}
      style={{
        height: containerHeight,
        borderTopLeftRadius: topRadius,
        borderTopRightRadius: topRadius,
        borderBottomRightRadius: topRadius,
        borderBottomLeftRadius: topRadius,
      }}
      role="figure"
      aria-label="Fancy images section"
    >
      {images.map((img, idx) => (
        <div
          key={idx}
          className={`fancy-slice fancy-slice-${idx + 1}`}
          style={{
            backgroundImage: `url("${img.src}")`,
          }}
          aria-label={`Decorative Image Slice ${idx + 1}`}
        >
          <div className="fancy-caption">{img.caption}</div>
        </div>
      ))}
    </div>
  );
};

FancyImagesSection.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      src: PropTypes.string.isRequired,
      caption: PropTypes.string,
    })
  ).isRequired,
  containerHeight: PropTypes.string,
  topRadius: PropTypes.string,
  styleVariant: PropTypes.string,
};

FancyImagesSection.defaultProps = {
  containerHeight: '400px',
  topRadius: '1.5rem',
  styleVariant: '',
};

export default FancyImagesSection;
