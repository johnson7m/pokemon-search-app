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

export const logInWithGoogle = async () => {
  const result = await signInWithPopup(gAuth, googleProvider);
  const user = result.user;
  await updateUserProfileInFirestore(user.uid, {
    displayName: user.displayName || 'New Trainer',
    email: user.email,
  });
  return user;
};

export const signUp = async (email, password, displayName = 'New Trainer') => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  if (displayName && displayName !== 'New Trainer') {
    await updateProfile(user, { displayName });
  }
  await updateUserProfileInFirestore(user.uid, {
    displayName: displayName || 'New Trainer',
    email: user.email,
  });
  return user;
};

export const logIn = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await updateUserProfileInFirestore(user.uid, {
    displayName: user.displayName || 'New Trainer',
    email: user.email,
  });
  return user;
};

export const logOut = () => {
  return signOut(auth);
};
