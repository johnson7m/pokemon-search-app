// src/components/Navbar.js
import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logOut } from '../services/authService';
import { Navbar, Nav, Button, Offcanvas } from 'react-bootstrap';
import { ThemeContext } from '../contexts/ThemeContext';
import { useAuthContext } from '../contexts/AuthContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const CustomNavbar = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  

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
                <Nav.Link style={{color: `${theme === 'light' ? 'black' : 'white'}`}} as={Link} to="/home" onClick={handleClose}>Home</Nav.Link>
                <Nav.Link style={{color: `${theme === 'light' ? 'black' : 'white'}`}} as={Link} to="/profile" onClick={handleClose}>
                  Profile
                </Nav.Link>
                <Nav.Link style={{color: `${theme === 'light' ? 'black' : 'white'}`}} as={Link} to="/search" onClick={handleClose}>
                  Search
                </Nav.Link>
                <Nav.Link style={{color: `${theme === 'light' ? 'black' : 'white'}`}} onClick={handleLogOut}>Log Out</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/signup" onClick={handleClose}>
                  Sign Up
                </Nav.Link>
                <Nav.Link as={Link} to="/login" onClick={handleClose}>
                  Log In
                </Nav.Link>
                <Nav.Link style={{color: `${theme === 'light' ? 'black' : 'white'}`}} as={Link} to="/home" onClick={handleClose}>Home</Nav.Link>
                <Nav.Link style={{color: `${theme === 'light' ? 'black' : 'white'}`}} as={Link} to="/search" onClick={handleClose}>
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


/*// src/components/CustomNavbar.js
import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { logOut } from '../services/authService';
import { Navbar, Nav, Button, NavDropdown } from 'react-bootstrap';
import { ThemeContext } from '../contexts/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const CustomNavbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogOut = async () => {
    await logOut();
    navigate('/login');
  };

  return (
    <Navbar
      bg={theme === 'light' ? 'white' : 'dark'}
      variant={theme === 'light' ? 'light' : 'dark'}
      expand="lg"
      fixed="top"
    >
      <Navbar.Brand as={Link} to="/" className="mx-3">
        Pokémon Search
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" className="mx-3" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ms-auto align-items-center">
          <Button
            variant={theme === 'light' ? 'light' : 'dark'}
            onClick={toggleTheme}
            className="me-2"
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
            <NavDropdown
              title={user.email || 'Account'}
              data-bs-theme={theme === 'light' ? 'light' : 'dark'}
              id="user-nav-dropdown" 
              align="end"
            >
              <NavDropdown.Item as={Link} to="/profile">
                Profile
              </NavDropdown.Item>
              <NavDropdown.Item onClick={handleLogOut}>
                Log Out
              </NavDropdown.Item>
            </NavDropdown>
          ) : (
            <>
              <Nav.Link as={Link} to="/signup">
                Sign Up
              </Nav.Link>
              <Nav.Link as={Link} to="/login">
                Log In
              </Nav.Link>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default CustomNavbar;
 */