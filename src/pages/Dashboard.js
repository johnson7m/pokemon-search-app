// src/pages/Dashboard.js
import React, { useEffect, useState, useContext } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { ThemeContext } from '../contexts/ThemeContext';
import { useAuthContext } from '../contexts/AuthContext';
import { getUserStats } from '../services/statisticService';
import { getRecommendedPokemon } from '../services/recommendationService';

const Dashboard = () => {
  const { theme } = useContext(ThemeContext);
  const { user } = useAuthContext();
  const [stats, setStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const userStats = await getUserStats(user.uid);
          setStats(userStats);

          if (userStats.totalFavorites > 0) {
            const recommendedPokemon = await getRecommendedPokemon(userStats.favorites || []);
            setRecommendations(recommendedPokemon);
          }
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

  if (!user) {
    return (
      <Container className="mt-5 text-center">
        <p>Please log in to view your dashboard.</p>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p>Loading your dashboard...</p>
      </Container>
    );
  }

  return (
    <Container data-bs-theme={theme} className="mt-5">
      <h2>Welcome, {user.displayName || 'Trainer'}!</h2>
      <Row className="mt-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Your Profile Summary</Card.Title>
              <p>
                <strong>Total Searches:</strong> {stats?.totalSearches || 0}
              </p>
              <p>
                <strong>Total Favorites:</strong> {stats?.totalFavorites || 0}
              </p>
              <p>
                <strong>Total Time Spent:</strong> {stats?.totalTimeSpent || 0} minutes
              </p>
              <Button variant="primary" href="/profile">
                Manage Profile
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Recommended Pokémon</Card.Title>
              {recommendations.length > 0 ? (
                <Row>
                  {recommendations.map((pokemon) => (
                    <Col key={pokemon.id} xs={6} sm={4} md={3} lg={2} className="mb-4">
                      <Card>
                        <Card.Img
                          src={pokemon.sprites.front_default}
                          alt={pokemon.name}
                          className="img-fluid"
                        />
                        <Card.Body>
                          <Card.Title className="text-center text-capitalize">
                            {pokemon.name}
                          </Card.Title>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <p>No recommendations available yet. Add more favorites to get suggestions!</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
