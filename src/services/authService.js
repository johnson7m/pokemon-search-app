// src/services/authService.js
import { auth } from '../firebase';
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const gAuth = getAuth();
const googleProvider = new GoogleAuthProvider();


export const logInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(gAuth, googleProvider);
    return result.user; // user info
  } catch (err) {
    throw new Error(err.message);
  }
}


// Sign up function
export const signUp = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Log in function
export const logIn = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Log out function
export const logOut = () => {
  return signOut(auth);
};
