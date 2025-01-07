// src/components/SearchBarSkeleton.js
import React from 'react';
import ContentLoader from 'react-content-loader';
import { Row, Col } from 'react-bootstrap';

const SearchBarSkeleton = () => (
  <Row className="mt-3">
    {[...Array(4)].map((_, index) => (
      <Col xs={12} md={6} lg={3} key={index}>
        <ContentLoader 
          speed={2}
          width={250}
          height={80}
          viewBox="0 0 250 80"
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
        >
          <rect x="0" y="10" rx="4" ry="4" width="250" height="20" /> 
          <rect x="0" y="40" rx="4" ry="4" width="150" height="15" />
        </ContentLoader>
      </Col>
    ))}
  </Row>
);

export default SearchBarSkeleton;
