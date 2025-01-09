// src/services/userService.js
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * Save user preferences in userPreferences/{userId}.
 */
export const saveUserPreferences = async (userId, preferences) => {
  try {
    const userPrefsRef = doc(db, 'userPreferences', userId);
    await setDoc(userPrefsRef, preferences, { merge: true });
  } catch (error) {
    console.error('Error saving user preferences:', error);
  }
};

/**
 * Get user preferences from userPreferences/{userId}.
 * Returns a default object if none exist.
 */
export const getUserPreferences = async (userId) => {
  try {
    const userPrefsRef = doc(db, 'userPreferences', userId);
    const docSnap = await getDoc(userPrefsRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // Return default preferences
      return { emailNotifications: true };
    }
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return { emailNotifications: true };
  }
};

/**
 * Create or update the doc in users/{userId} with new displayName (and optionally other fields).
 * Using merge: true ensures we never overwrite existing fields unless we specify them.
 */
export const updateUserProfileInFirestore = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, profileData, { merge: true });
    // e.g. profileData = { displayName: "Ash Ketchum", email: "ash@poke.com" }
  } catch (error) {
    console.error('Error updating user profile in Firestore:', error);
  }
};

/**
 * Retrieve the user doc from users/{userId}.
 */
export const getUserProfileFromFirestore = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
      return snapshot.data(); // e.g. { displayName: "Ash", email: "...", etc. }
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile from Firestore:', error);
    return null;
  }
};
