// src/components/Navbar.js
import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logOut } from '../services/authService';
import { Navbar, Nav, Button, Offcanvas, ProgressBar } from 'react-bootstrap';
import { ThemeContext } from '../contexts/ThemeContext';
import { useAuthContext } from '../contexts/AuthContext';
import { FaSun, FaMoon, FaStar } from 'react-icons/fa';

// 1) Import your user stats context
import { useUserStatsContext } from '../contexts/UserStatsContext';

// If you keep xpNeededForLevel here, great. Or import from statisticsService:
const xpNeededForLevel = (lvl) => (lvl <= 1 ? 0 : 100 * (lvl - 1) ** 2);

const CustomNavbar = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // 2) Read stats from context
  const { stats } = useUserStatsContext();
  // stats might be null if user is not logged in or data not loaded
  const level = stats?.level || 1;
  const xp = stats?.xp || 0;

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogOut = async () => {
    await logOut();
    navigate('/login');
  };

  const handleClose = () => setShowOffcanvas(false);
  const handleShow = () => setShowOffcanvas(true);

  // 3) Calculate progress for next level
  const currentLevelXpMin = xpNeededForLevel(level);
  const nextLevelXpRequirement = xpNeededForLevel(level + 1);
  const xpRange = nextLevelXpRequirement - currentLevelXpMin;
  const xpProgress = xp - currentLevelXpMin;

  return (
    <>
      <Navbar
        bg={theme === 'light' ? 'white' : 'dark'}
        variant={theme === 'light' ? 'light' : 'dark'}
        fixed="top"
        className={scrolled ? 'navbar-scrolled justify-content-between' : 'justify-content-between'}
      >
        <Navbar.Brand as={Link} to="/" className="mx-3">
          Pokémon Search
        </Navbar.Brand>

        {/* Show XP bar and Level if user is logged in & stats are available */}
        {user && stats && (
          <div className="d-flex align-items-center me-3">
            <div style={{ position: 'relative', width: '100px', marginRight: '0.5rem' }}>
              <ProgressBar
                now={xpProgress}
                max={xpRange}
                variant={theme === 'light' ? 'info' : 'secondary'}
                style={{ height: '1rem' }}
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

            {/* Show the level icon with the level number */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <FaStar style={{ fontSize: '1.5rem', color: theme === 'light' ? '#000' : '#fff' }} />
              <span
                style={{
                  position: 'absolute',
                  top: '55%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '0.75rem',
                  color: theme === 'light' ? 'white' : 'black',
                }}
              >
                {level}
              </span>
            </div>
          </div>
        )}

        <Button variant="link" onClick={handleShow} className="me-3">
          <span className="navbar-toggler-icon"></span>
        </Button>
      </Navbar>

      <Offcanvas
        show={showOffcanvas}
        onHide={handleClose}
        placement="end"
        backdrop
        scroll
        className={theme === 'light' ? 'bg-light' : 'bg-dark text-white'}
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
              aria-label="Toggle Theme"
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

            {user ? (
              <>
                <Nav.Link
                  style={{ color: theme === 'light' ? 'black' : 'white' }}
                  as={Link}
                  to="/home"
                  onClick={handleClose}
                >
                  Home
                </Nav.Link>
                <Nav.Link
                  style={{ color: theme === 'light' ? 'black' : 'white' }}
                  as={Link}
                  to="/profile"
                  onClick={handleClose}
                >
                  Profile
                </Nav.Link>
                <Nav.Link
                  style={{ color: theme === 'light' ? 'black' : 'white' }}
                  as={Link}
                  to="/search"
                  onClick={handleClose}
                >
                  Search
                </Nav.Link>
                <Nav.Link
                  style={{ color: theme === 'light' ? 'black' : 'white' }}
                  onClick={handleLogOut}
                >
                  Log Out
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/signup" onClick={handleClose}>
                  Sign Up
                </Nav.Link>
                <Nav.Link as={Link} to="/login" onClick={handleClose}>
                  Log In
                </Nav.Link>
                <Nav.Link
                  style={{ color: `${theme === 'light' ? 'black' : 'white'}` }}
                  as={Link}
                  to="/home"
                  onClick={handleClose}
                >
                  Home
                </Nav.Link>
                <Nav.Link
                  style={{ color: `${theme === 'light' ? 'black' : 'white'}` }}
                  as={Link}
                  to="/search"
                  onClick={handleClose}
                >
                  Search
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
