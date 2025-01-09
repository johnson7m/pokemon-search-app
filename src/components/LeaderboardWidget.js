// src/components/LeaderboardWidget.js
import React, { useState, useEffect } from 'react';
import { Form, Table, Spinner, Container } from 'react-bootstrap';
import {
  getTopFavorites,
  getTopBadges,
  getTopWaterEnjoyers,
} from '../services/leaderboardService';

// Example type definitions
const LEADERBOARD_TYPES = [
  { value: 'favorites', label: 'Most Favorites' },
  { value: 'badges', label: 'Most Badges' },
  { value: 'water', label: 'Water Enjoyers' },
];

const LeaderboardWidget = () => {
  const [leaderboardType, setLeaderboardType] = useState('favorites');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  // A function to fetch data based on the current leaderboardType
  const fetchLeaderboard = async (type) => {
    setLoading(true);
    try {
      let data;
      if (type === 'favorites') {
        data = await getTopFavorites(10);
      } else if (type === 'badges') {
        data = await getTopBadges(10);
      } else if (type === 'water') {
        data = await getTopWaterEnjoyers(10);
      } else {
        data = [];
      }
      setResults(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setResults([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard(leaderboardType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaderboardType]);

  return (
    <div>
      <h5>Global Leaderboard</h5>
      <Form.Group controlId="leaderboardSelect" className="mb-3">
        <Form.Label>Select Leaderboard Type:</Form.Label>
        <Form.Control
          as="select"
          value={leaderboardType}
          onChange={(e) => setLeaderboardType(e.target.value)}
        >
          {LEADERBOARD_TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Form.Control>
      </Form.Group>

      {loading ? (
        <Container className="text-center my-4">
            <Spinner animation="border" role="status" />
            <div className="mt-2">Loading...</div>
        </Container>
      ) : (
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              {/* The columns can vary based on the type */}
              {/* We'll just show 'favorites' or 'badges' or 'waterCount' etc. */}
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {results.length > 0 ? (
              results.map((userData, index) => {
                // userData might contain { userId, totalFavorites, badgesCount, waterCount, etc.}
                let score = 0;
                if (leaderboardType === 'favorites') {
                  score = userData.totalFavorites || 0;
                } else if (leaderboardType === 'badges') {
                  score = userData.badgesCount || 0;
                } else if (leaderboardType === 'water') {
                  score = userData.waterCount || 0;
                }

                return (
                  <tr key={userData.userId}>
                    <td>{index + 1}</td>
                    <td>
                      {userData.displayName || 'Unknown'}{' '}
                    </td>
                    <td>{score}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3} className="text-center">
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default LeaderboardWidget;
