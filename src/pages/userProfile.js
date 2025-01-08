// src/pages/UserProfile.js
import React, { useContext, useState, useEffect } from 'react';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { ThemeContext } from '../contexts/ThemeContext';
import { getUserStats, getUserPreferences, saveUserPreferences } from '../services/userService';
import { useAuthContext } from '../contexts/AuthContext';

const UserProfile = () => {
  const { theme } = useContext(ThemeContext);
  const { user } = useAuthContext();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState(null);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
  });

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };
  
  useEffect(() => {
    const fetchUserStats = async () => {
      if (user) {
        const userStats = await getUserStats(user.uid);
        setStats(userStats);
      }
    };

      const fetchUserPreferences = async () => {
        if (user) {
          const prefs = await getUserPreferences(user.uid);
          setPreferences(prefs);
        }
      };

    if (user) {
      setDisplayName(user.displayName || 'new user');
      setEmail(user.email || '');
      fetchUserStats();
      fetchUserPreferences();
    }
  }, [user]);
  
    const handlePreferencesChange = (e) => {
      const { name, value, checked, type } = e.target;
      setPreferences((prevPrefs) => ({
        ...prevPrefs,
        [name]: type === 'checkbox' ? checked : value,
      }));
    };
  
    const handleSavePreferences = async () => {
      if (user) {
        await saveUserPreferences(user.uid, preferences);
        setMessage('Preferences saved.');
      }
    };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      if (user) {
        if (displayName !== user.displayName) {
          await updateProfile(user, { displayName });
        }
        if (email !== user.email) {
          await updateEmail(user, email);
        }
        if (newPassword) {
          if (!validatePassword(newPassword)) {
            setMessage(
              'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.'
            );
            return;
          }
          await updatePassword(user, newPassword);
        }
        setMessage('Profile updated successfully.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile. Please try again.');
    }
  };

  return (
    <Container data-bs-theme={theme} className="mt-5">
      <h2>User Profile</h2>
      {message && <Alert variant="info">{message}</Alert>}
      <Form onSubmit={handleUpdateProfile}>
        <Form.Group controlId="displayName" className="mb-3">
          <Form.Label>Display Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="email" className="mb-3">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="newPassword" className="mb-3">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter a new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Form.Text className="text-muted">
            Leave blank to keep your current password.
          </Form.Text>
        </Form.Group>
        <Button variant="primary" type="submit">
          Update Profile
        </Button>
        <hr />
        <h3>Preferences</h3>
        <Form.Group controlId="emailNotifications" className="mb-3">
          <Form.Label>Theme Preference</Form.Label>
            <Form.Check
              type="checkbox"
              label="Receive Email Notifications"
              name="emailNotifications"
              checked={preferences.emailNotifications}
              onChange={handlePreferencesChange}
        />
          </Form.Group>
        <Button variant="primary" onClick={handleSavePreferences}>
          Save Preferences
        </Button>
        {stats && (
          <section className="mt-5">
            <h3>Your Statistics</h3>
              <ul>
                <li>Total Pokémon Searched: {stats.totalSearches}</li>
                <li>Total Favorites: {stats.totalFavorites}</li>
                <li>Total Time Spent: {stats.totalTimeSpent} minutes</li>
              </ul>
            <h3>Your Achievements</h3>
            <p>Coming soon!</p>
          </section>
        )}        
      </Form>
    </Container>
  );
};

export default UserProfile;



{/**/}