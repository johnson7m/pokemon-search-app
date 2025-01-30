// src/pages/Dashboard.js
import React, { useEffect, useState, useContext } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  ProgressBar,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import { FaStar, FaMedal } from 'react-icons/fa';
import { ThemeContext } from '../contexts/ThemeContext';
import { useAuthContext } from '../contexts/AuthContext';
import { getUserStats } from '../services/statisticsService';
import { Link } from 'react-router-dom';
import { getFavoritePokemon } from '../services/firestoreService';
import { getRecommendedPokemon } from '../services/recommendationService';
import { syncWaterCounts } from '../adminTools/syncHandlers';
import PokemonCarousel from '../components/PokemonCarousel';
import LeaderboardWidget from '../components/LeaderboardWidget';
import './Dashboard.css';
import { motion } from 'framer-motion';
import { usePageContext } from '../contexts/PageContext';

const xpNeededForLevel = (lvl) => (lvl <= 1 ? 0 : 100 * (lvl - 1) ** 2);

const variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};


const Dashboard = React.memo(() => {
  const { theme } = useContext(ThemeContext);
  const { user } = useAuthContext();
  const { pageState } = usePageContext();

  const [stats, setStats] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleSyncWaterCounts = async () => {
    try {
      await syncWaterCounts();
      alert('Water type sync completed!');
    } catch (error) {
      console.error('Error syncing water counts:', error);
      alert('Failed to sync water counts.');
    }
  };

  useEffect(() => {
    console.log('Dashboard mounted');
    return () => {
      console.log('Dashboard unmounted');
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
  
    const fetchData = async () => {
      if (user) {
        try {
          const [userStats, userFavorites] = await Promise.all([
            getUserStats(user.uid),
            getFavoritePokemon(),
          ]);
  
          if (isMounted) {
            setStats(userStats);
            setFavorites(userFavorites);
  
            if (userFavorites.length > 0) {
              const recommendedPokemon = await getRecommendedPokemon(userFavorites);
              if (isMounted) setRecommendations(recommendedPokemon);
            }
          }
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          if (isMounted) setLoading(false);
        }
      }
    };
  
    fetchData();
  
    return () => {
      isMounted = false;
    };
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

  const totalSearches = stats?.totalSearches || 0;
  const totalFavorites = stats?.totalFavorites || 0;
  const totalTimeSpent = stats?.totalTimeSpent || 0;
  const level = stats?.level || 1;
  const xp = stats?.xp || 0;
  const achievements = stats?.achievements || [];
  const badges = stats?.badges || [];

  const currentLevelXpMin = xpNeededForLevel(level);
  const nextLevelXpRequirement = xpNeededForLevel(level + 1);
  const xpRange = nextLevelXpRequirement - currentLevelXpMin;
  const xpProgress = xp - currentLevelXpMin;
  const xpToNext = nextLevelXpRequirement - xp;

  return (
    <motion.div
      key="dashboard"
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2 }}
    >
    <Container data-bs-theme={theme} className="mt-5" aria-label="Dashboard">
      <h2>
        {user.displayName || 'New Trainer'}'s Dashboard!
      </h2>

      <Row className="mt-4 g-4">
        <Col xs={12} sm={12} md={6} lg={6} className="d-flex align-items-stretch">
          <Card className="dashboard-card flex-fill" aria-label="Profile Summary">
            <Card.Body>
              <Card.Title>Your Profile Summary</Card.Title>
              <p>
                <strong>Total Searches:</strong> {totalSearches}
              </p>
              <p>
                <strong>Total Favorites:</strong> {totalFavorites}
              </p>
              <p>
                <strong>Total Time Spent:</strong> {totalTimeSpent} minutes
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
          <Card className="dashboard-card flex-fill" aria-label="Recommended Pokémon">
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

      <Row className="mt-1 g-4">
        <Col xs={12} md={4} lg={6}>
          <Card className="dashboard-card flex-fill" aria-label="Progress & Achievements">
            <Card.Body>
              <Card.Title>Progress & Achievements</Card.Title>

              <p>
                <strong>Level:</strong> {level}
              </p>
              <p>
                <strong>XP:</strong> {xp}
              </p>
              <ProgressBar
                now={xpProgress}
                max={xpRange}
                label={`L${level}: ${xpProgress}/${xpRange} XP`}
              />
              <p style={{ marginTop: '0.5rem' }}>
                {xpToNext > 0
                  ? `${xpToNext} XP to reach Level ${level + 1}`
                  : 'You are ready to level up!'}
              </p>

              <h5 className="mt-4">Achievements</h5>
              {achievements.length > 0 ? (
                <Row>
                  {achievements.map((ach) => (
                    <Col xs="auto" key={ach}>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>{ach}</Tooltip>}
                      >
                        <div style={{ fontSize: '2rem', cursor: 'pointer' }}>
                          <FaStar />
                        </div>
                      </OverlayTrigger>
                    </Col>
                  ))}
                </Row>
              ) : (
                <p>No achievements yet.</p>
              )}

              <h5 className="mt-4">Badges</h5>
              {badges.length > 0 ? (
                <Row>
                  {badges.map((badge) => (
                    <Col xs="auto" key={badge}>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>{badge}</Tooltip>}
                      >
                        <div style={{ fontSize: '2rem', cursor: 'pointer' }}>
                          <FaMedal />
                        </div>
                      </OverlayTrigger>
                    </Col>
                  ))}
                </Row>
              ) : (
                <p>No badges yet.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={8} lg={6}>
          <Card className="dashboard-card flex-fill" aria-label="Leaderboard Widget">
            <Card.Body>
              <LeaderboardWidget />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
    </motion.div>
  );
});

export default Dashboard;
