// src/components/Login.js
import React, { useState, useContext } from 'react';
import { logIn, logInWithGoogle } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { ThemeContext } from '../contexts/ThemeContext';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate(); // Use navigate for redirection

  


  const handleLogIn = async (e) => {
    e.preventDefault();
    try {
      await logIn(email, password);
      setSuccess('Login Successful!');
      setError('');
      setEmail('');
      setPassword('');
      // Redirect to the home page or another page after successful login
      navigate('/');
    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  return (
    <Container data-bs-theme={theme === 'light' ? 'light' : 'dark'} className="mt-5">
        <h2>Log In</h2>
        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        <Form  onSubmit={handleLogIn}>
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
          <div className="d-flex flex-column align-items-center mt-3">
          <Button
            variant={theme === 'light' ? 'dark' : 'light'}
            type="submit"
            className="mb-2"
            style={{ width: '200px' }}
          >
            Log In
          </Button>
          <Button
            variant="outline-secondary"
            onClick={async () => {
              try {
                const user = await logInWithGoogle();
                setSuccess(`Welcome, ${user.displayName}`);
                navigate('/');
              } catch (err) {
                setError(err.message);
              }
            }}
            style={{ width: '200px' }}
          >
            <i className="bi bi-google" style={{ marginRight: '8px' }}></i>
            Log In with Google
          </Button>
        </div>
        <div className="mt-3 text-center">
          <p>
            Don't have an account?{' '}
            <Button variant="link" className="p-0" onClick={() => navigate('/signup')}>
              Create one here
            </Button>
          </p>
        </div>
        </Form>
    </Container>   
  );
};

export default Login;
