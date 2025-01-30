// src/components/Navbar.js
import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logOut } from '../services/authService';
import { Navbar, Nav, Button, Offcanvas, ProgressBar } from 'react-bootstrap';
import { ThemeContext } from '../contexts/ThemeContext';
import { useAuthContext } from '../contexts/AuthContext';
import { FaSun, FaMoon, FaStar } from 'react-icons/fa';
import { useUserStatsContext } from '../contexts/UserStatsContext';

const xpNeededForLevel = (lvl) => (lvl <= 1 ? 0 : 100 * (lvl - 1) ** 2);

const CustomNavbar = ({ scrolled }) => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { theme, toggleTheme, accessibilityMode, toggleAccessibilityMode } = useContext(ThemeContext);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const location = useLocation();

  const { stats } = useUserStatsContext();
  const level = stats?.level || 1;
  const xp = stats?.xp || 0;

  const handleLogOut = async () => {
    await logOut();
    navigate('/login');
  };

  const handleClose = () => setShowOffcanvas(false);
  const handleShow = () => setShowOffcanvas(true);

  const currentLevelXpMin = xpNeededForLevel(level);
  const nextLevelXpRequirement = xpNeededForLevel(level + 1);
  const xpRange = nextLevelXpRequirement - currentLevelXpMin;
  const xpProgress = xp - currentLevelXpMin;



  return (
    <>
      <Navbar
        bg={theme === 'light' ? 'white' : 'dark'}
        variant={theme === 'light' ? 'light' : 'dark'}
        sticky="top"
        className={`justify-content-between ${scrolled ? 'navbar-scrolled' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <Navbar.Brand as={Link} to="/" className="mx-3">
          Pokémon Search
        </Navbar.Brand>

        {user && stats && (
          <div className="d-flex align-items-center me-3">
            <div style={{ position: 'relative', width: '100px', marginRight: '0.5rem' }}>
              <ProgressBar
                now={xpProgress}
                max={xpRange}
                variant={theme === 'light' ? 'info' : 'secondary'}
                style={{ height: '1rem', borderRadius: '0.5rem' }}
                aria-label={`XP progress: ${xpProgress} of ${xpRange} for next level`}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  color: theme === 'light' ? 'black' : 'black',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}
              >
                {`${xpProgress}/${xpRange}`}
              </div>
            </div>

            <div style={{ position: 'relative', display: 'inline-block' }}>
              <FaStar
                style={{
                  fontSize: '1.5rem',
                  color: theme === 'light' ? '#000' : '#fff',
                  outline: 'none'
                }}
                aria-hidden="true"
              />
              <span
                style={{
                  position: 'absolute',
                  top: '55%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '0.75rem',
                  color: theme === 'light' ? 'white' : 'black',
                  pointerEvents: 'none',
                }}
                aria-label={`Level ${level}`}
              >
                {level}
              </span>
            </div>
          </div>
        )}

        <Button
          variant="link"
          onClick={handleShow}
          className="me-3"
          aria-label="Open navigation menu"
        >
          <span className="navbar-toggler-icon"></span>
        </Button>
      </Navbar>

      <Offcanvas
        show={showOffcanvas}
        onHide={handleClose}
        placement="end"
        backdrop
        scroll
        className={`${theme === 'light' ? 'bg-light' : 'bg-dark text-white'}`}
        aria-label="Offcanvas Menu"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            <Button
              variant={theme === 'light' ? 'outline-dark' : 'outline-light'}
              onClick={toggleTheme}
              className="mb-3"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <>
                  Light Mode&nbsp;
                  <FaSun />
                </>
              ) : (
                <>
                  Dark Mode&nbsp;
                  <FaMoon />
                </>
              )}
            </Button>
            {/* ACCESSIBILITY MODE TOGGLE */}
            <Button
              variant={theme === 'light' ? 'outline-dark' : 'outline-light'}
              onClick={toggleAccessibilityMode}
              className="mb-3"
              aria-pressed={accessibilityMode}
              aria-label="Toggle accessibility mode"
            >
              {accessibilityMode ? 'Accessibility: ON' : 'Accessibility: OFF'}
            </Button>            

            {user ? (
              <>
                <Nav.Link
                  style={{ color: theme === 'light' ? 'black' : 'white' }}
                  as={Link}
                  to="/home"
                  onClick={handleClose}
                  aria-label="Go to Home"
                >
                  Home
                </Nav.Link>
                <Nav.Link
                  style={{ color: theme === 'light' ? 'black' : 'white' }}
                  as={Link}
                  to="/profile"
                  onClick={handleClose}
                  aria-label="Go to Profile"
                >
                  Profile
                </Nav.Link>
                <Nav.Link
                  style={{ color: theme === 'light' ? 'black' : 'white' }}
                  onClick={handleLogOut}
                  aria-label="Log out"
                >
                  Log Out
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/signup" onClick={handleClose} aria-label="Sign Up">
                  Sign Up
                </Nav.Link>
                <Nav.Link as={Link} to="/login" onClick={handleClose} aria-label="Log In">
                  Log In
                </Nav.Link>
                <Nav.Link
                  style={{ color: theme === 'light' ? 'black' : 'white' }}
                  as={Link}
                  to="/"
                  onClick={handleClose}
                  aria-label="Go to Demo"
                >
                  Back to demo
                </Nav.Link>
              </>
            )}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default CustomNavbar;
