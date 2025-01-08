// src/pages/UserProfile.js
import React, { useContext, useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { ThemeContext } from '../contexts/ThemeContext';
import { getUserPreferences, saveUserPreferences } from '../services/userService';
import { useAuthContext } from '../contexts/AuthContext';
import ProfileForm from '../components/ProfileForm';
import PreferencesForm from '../components/PreferencesForm';

const UserProfile = () => {
  const { theme } = useContext(ThemeContext);
  const { user } = useAuthContext();
  const [preferences, setPreferences] = useState(null);

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (user) {
        const prefs = await getUserPreferences(user.uid);
        setPreferences(prefs);
      }
    };
    fetchUserPreferences();
  }, [user]);

  const handleSavePreferences = async (prefs) => {
    if (user) {
      await saveUserPreferences(user.uid, prefs);
    }
  };

  return (
    <Container data-bs-theme={theme} className="mt-5">
      <h2>User Profile</h2>
      {user && preferences ? (
        <>
          <ProfileForm user={user} />
          <hr />
          <h3>Preferences</h3>
          <PreferencesForm preferences={preferences} onSave={handleSavePreferences} />
        </>
      ) : (
        <p>Loading...</p>
      )}
    </Container>
  );
};

export default UserProfile;
