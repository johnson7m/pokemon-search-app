// src/services/authService.js
import { auth } from '../firebase';
import {
  updateProfile,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { updateUserProfileInFirestore } from './userService';

const gAuth = getAuth();
const googleProvider = new GoogleAuthProvider();

/**
 * Log in with Google. On success, also ensure we have a "users/{uid}" doc
 * with at least { displayName, email }.
 */
export const logInWithGoogle = async () => {
  const result = await signInWithPopup(gAuth, googleProvider);
  const user = result.user;

  // If user doc doesn't exist, create it. If it does, merge changes:
  await updateUserProfileInFirestore(user.uid, {
    displayName: user.displayName || 'New Trainer',
    email: user.email,
  });

  return user; 
};

/**
 * Sign up with email & password. Optionally accept a displayName param (defaults to 'New Trainer').
 */
export const signUp = async (email, password, displayName = 'New Trainer') => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Set the user's displayName in Firebase Auth if needed:
  if (displayName && displayName !== 'New Trainer') {
    await updateProfile(user, { displayName });
  }

  // Also create/merge doc in "users/{uid}"
  await updateUserProfileInFirestore(user.uid, {
    displayName: displayName || 'New Trainer',
    email: user.email,
  });

  return user; // or userCredential
};

/**
 * Log in via email & password. After successful login,
 * we'll do the same approach: create/merge user doc if missing.
 */
export const logIn = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Make sure we have users/{uid} doc:
  await updateUserProfileInFirestore(user.uid, {
    displayName: user.displayName || 'New Trainer',
    email: user.email,
  });

  return user;
};

/**
 * Log out
 */
export const logOut = () => {
  return signOut(auth);
};
