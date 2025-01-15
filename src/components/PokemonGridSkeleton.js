// src/components/PokemonGridSkeleton.js
import React from 'react';
import ContentLoader from 'react-content-loader';
import { Row, Col } from 'react-bootstrap';

const PokemonGridSkeleton = () => (

  <Row>
    {[...Array(8)].map((_, index) => (
      <Col xs={6} sm={4} md={3} lg={3} key={index} className="mb-4">
        <ContentLoader 
          speed={2}
          width={250}
          height={350}
          viewBox="0 0 250 350"
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
        >
          <rect x="25" y="15" rx="10" ry="10" width="200" height="200" /> 
          <rect x="25" y="230" rx="4" ry="4" width="200" height="20" /> 
          <rect x="25" y="260" rx="3" ry="3" width="150" height="15" />
        </ContentLoader>
      </Col>
    ))}
  </Row>
);

export default PokemonGridSkeleton;
