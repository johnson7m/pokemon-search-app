// src/components/SignUp.js
import React, { useState, useContext } from 'react';
import { signUp } from '../services/authService'; // Assumes authService.js is already set up
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { ThemeContext } from '../contexts/ThemeContext';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const {theme, toggleTheme} = useContext(ThemeContext);


  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await signUp(email, password);
      setSuccess('Account created successfully!'); // account created
      setError('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError('An account with that email address already exists', err.message);
      setSuccess(''); // clear message
    }
  };

  return (
    <Container data-bs-theme={theme === 'light' ? 'light' : 'dark'} className="mt-5">
      <h2>Sign Up</h2>
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSignUp}>
        <Form.Group>
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Button className="mt-2" variant={theme === 'light' ? 'dark' : 'light'} type="submit">
          Sign Up
        </Button>
      </Form>
    </Container>
  );
};

export default SignUp;
