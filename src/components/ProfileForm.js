// src/components/ProfileForm.js
import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';

const ProfileForm = ({ user }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');


  // Update state when the user prop changes
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user]);
  
  
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
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
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile. Please try again.');
    }
  };

  return (
    <>
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
      </Form>
    </>
  );
};

export default ProfileForm;
