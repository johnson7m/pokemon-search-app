// src/components/PreferencesForm.js
import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

const PreferencesForm = ({ preferences, onSave }) => {
  const [prefs, setPrefs] = useState(preferences);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setPrefs(preferences);
  }, [preferences]); //sysncs local state with prop changes

  const handlePreferencesChange = (e) => {
    const { name, checked, type } = e.target;
    setPrefs((prevPrefs) => ({
      ...prevPrefs,
      [name]: type === 'checkbox' ? checked : e.target.value,
    }));
  };

  const handleSavePreferences = async () => {
    await onSave(prefs);
    setMessage('Preferences saved.');
  };

  return (
    <>
      {message && <Alert variant="info">{message}</Alert>}
      <Form>
        <Form.Group controlId="emailNotifications" className="mb-3">
          <Form.Check
            type="checkbox"
            label="Receive Email Notifications"
            name="emailNotifications"
            checked={prefs.emailNotifications}
            onChange={handlePreferencesChange}
          />
        </Form.Group>
        <Button variant="primary" onClick={handleSavePreferences}>
          Save Preferences
        </Button>
      </Form>
    </>
  );
};

export default PreferencesForm;
