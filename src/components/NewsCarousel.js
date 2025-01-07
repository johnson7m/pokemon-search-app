import React, { useState, useEffect, useContext } from 'react';
import { Carousel, Row, Col, Card, Button } from 'react-bootstrap';
import './NewsCarousel.css';

const NewsCarousel = ({ newsArticles, theme }) => {
  const [chunkSize, setChunkSize] = useState(3);

  useEffect(() => {
    const updateChunkSize = () => {
      if (window.innerWidth < 576) {
        setChunkSize(1);
      } else if (window.innerWidth < 768) {
        setChunkSize(2);
      } else {
        setChunkSize(3);
      }
    };

    window.addEventListener('resize', updateChunkSize);
    updateChunkSize();

    return () => window.removeEventListener('resize', updateChunkSize);
  }, []);

  const slides = [];
  for (let i = 0; i < newsArticles.length; i += chunkSize) {
    slides.push(newsArticles.slice(i, i + chunkSize));
  }

  return (
    <Carousel indicators={false} interval={null}>
      {slides.map((slide, index) => (
        <Carousel.Item key={index}>
          <Row className="justify-content-center">
            {slide.map((article, idx) => (
              <Col key={idx} xs={12} sm={6} md={4}>
                <Card
                  data-bs-theme={theme === 'light' ? 'light' : 'dark'}
                  className="mb-3 h-100"
                >
                  {article.urlToImage && (
                    <Card.Img
                      variant="top"
                      src={article.urlToImage}
                      alt={article.title}
                    />
                  )}
                  <Card.Body>
                    <Card.Title>{article.title}</Card.Title>
                    <Card.Text>
                      {article.description
                        ? article.description
                        : article.content
                        ? article.content.substring(0, 100) + '...'
                        : 'No description available.'}
                    </Card.Text>
                    <Button
                      variant={theme === 'light' ? 'dark' : 'light'}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read More
                    </Button>
                  </Card.Body>
                  <Card.Footer>
                    <small className="text-muted">
                      Published at {new Date(article.publishedAt).toLocaleString()}
                    </small>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default NewsCarousel;
