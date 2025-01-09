// src/components/ProfileForm.js
import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import {
  updateUserProfileInFirestore,
  getUserProfileFromFirestore,
} from '../services/userService';

const ProfileForm = ({ user }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;

    // Start with Auth's data:
    setDisplayName(user.displayName || '');
    setEmail(user.email || '');

    // Optionally merge Firestore data:
    // (Uncomment if you want to override local form fields with Firestore user doc data)
    /*
    getUserProfileFromFirestore(user.uid).then((profileData) => {
      if (profileData) {
        if (profileData.displayName) setDisplayName(profileData.displayName);
        if (profileData.email) setEmail(profileData.email);
      }
    });
    */
  }, [user]);

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      let updatedSomething = false;

      // 1) If displayName changed in form => update Auth + Firestore
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
        await updateUserProfileInFirestore(user.uid, { displayName });
        updatedSomething = true;
      }

      // 2) If email changed, update in Auth + Firestore
      if (email !== user.email) {
        await updateEmail(user, email);
        await updateUserProfileInFirestore(user.uid, { email });
        updatedSomething = true;
      }

      // 3) If password changed
      if (newPassword) {
        if (!validatePassword(newPassword)) {
          setMessage(
            'Password must be at least 8 chars, with uppercase, lowercase, number, special char.'
          );
          return;
        }
        await updatePassword(user, newPassword);
        updatedSomething = true;
      }

      setMessage(
        updatedSomething
          ? 'Profile updated successfully.'
          : 'No changes were made.'
      );
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
