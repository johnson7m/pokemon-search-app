// src/components/AnimatedRoutes.js
import React, { Suspense, lazy, useContext } from 'react';
import UserProfile from '../pages/UserProfile';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeContext } from '../contexts/ThemeContext';
import Loader from './Loader';



const Hero = lazy(() => import('../pages/Hero'));
const MainHomePage = lazy(() => import('../pages/MainHomePage'));
const SearchBar = lazy(() => import('./SearchBar'));
const Login = lazy(() => import('./Login'));
const SignUp = lazy(() => import('./SignUp'));
const PokemonDetailPage = lazy(() => import('../pages/PokemonDetailPage'));
const Account = lazy(() => import('../pages/Account'));
const SelectFeaturedPokemon = lazy(() => import('./SelectFeaturedPokemon'));
const Dashboard = lazy(() => import('../pages/Dashboard'));


const pageVariants = {
  initial: { opacity: 0, y: 50 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -50 },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.2,
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const {theme} = useContext(ThemeContext);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <Suspense fallback={<Loader />}>
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
            >
                <Hero />
              </motion.div>
            </Suspense>
          }
        />
        <Route 
        path="/select-featured-pokemon" 
        element={
            <Suspense fallback={<Loader />}>
                <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}>
                        <SelectFeaturedPokemon />
                </motion.div> 
            </Suspense> 
          } 
        />
        <Route
          path="/home"
          element={
            <Suspense fallback={<Loader />}>
                <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
            >
              <MainHomePage />
            </motion.div>
            </Suspense>
          }
        />
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<Loader />}>
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Dashboard />
                </motion.div>
              </Suspense>
            }
          />
          <Route 
          path='/search' 
          element={
            <Suspense fallback={<Loader />}>
            <motion.div 
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
                >
                    <SearchBar/>
                </motion.div>                
            </Suspense>
          }
           />
          <Route 
            path="/signup" 
            element={
                <Suspense fallback={<Loader />}>
                  <motion.div
                    initial="initial"
                    animate="in" 
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                >
                        <SignUp />
                    </motion.div>
                </Suspense>
            } 
            />
          <Route 
            path="/login" 
            element={
              <Suspense fallback={<Loader />}>
                <motion.div
                    initial="initial"
                    animate="in" 
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                >
                    <Login />
                </motion.div>
              </Suspense>
            } 
                    />
          <Route 
            path="/pokemon/:id" 
            element={
                <Suspense fallback={<Loader />}>
                    <motion.div
                    initial="initial"
                    animate="in" 
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                    >
                        <PokemonDetailPage />
                    </motion.div>
                </Suspense>
                }
            />
          <Route 
            path="/account" 
            element={
                <Suspense fallback={<Loader />}>
                    <motion.div
                    initial="initial"
                    animate="in" 
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                    >
                        <Account />
                    </motion.div>
                </Suspense>
                }
            />
          <Route 
            path="/profile" 
            element={
                <Suspense fallback={<Loader />}>
                    <motion.div
                    initial="initial"
                    animate="in" 
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                    >
                        <UserProfile/>
                    </motion.div>                    
                </Suspense>
                } 
            />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
