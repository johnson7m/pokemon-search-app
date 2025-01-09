import React, { useEffect, useState, useContext } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { ThemeContext } from '../contexts/ThemeContext';
import { useAuthContext } from '../contexts/AuthContext';
import { getUserStats } from '../services/statisticService';
import { Link } from 'react-router-dom';
import { getFavoritePokemon } from '../services/firestoreService';
import { getRecommendedPokemon } from '../services/recommendationService';
import PokemonCarousel from '../components/PokemonCarousel';
import './Dashboard.css'; // Import custom CSS for dashboard

const Dashboard = () => {
  const { theme } = useContext(ThemeContext);
  const { user } = useAuthContext();
  const [stats, setStats] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const [userStats, userFavorites] = await Promise.all([
            getUserStats(user.uid),
            getFavoritePokemon(),
          ]);

          setStats(userStats);
          setFavorites(userFavorites);

          if (userFavorites.length > 0) {
            const recommendedPokemon = await getRecommendedPokemon(userFavorites);
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
      <h2>{user.displayName || 'New Trainer'}'s Dashboard!</h2>
      <Row className="mt-4">
        <Col xs={12} sm={12} md={6} lg={6} className="d-flex align-items-stretch">
            <Card className="dashboard-card flex-fill">
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
                <Button
                data-bs-theme={theme === 'light' ? 'light' : 'dark'}
                variant="primary"
                as={Link}
                to={'/profile'}
                >
                Manage Profile
                </Button>
            </Card.Body>
            </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} className="d-flex align-items-stretch">
            <Card className="dashboard-card flex-fill">
            <Card.Body>
                <Card.Title>Recommended Pokémon</Card.Title>
                {recommendations.length > 0 ? (
                <PokemonCarousel
                    pokemonList={recommendations}
                    theme={theme}
                    autoCycle={true}
                    interval={3000}
                    className="dashboard-carousel"
                    dashboardMode={true}
                />
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
