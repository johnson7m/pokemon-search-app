import { db } from '../firebase';
import { doc } from 'firebase/firestore';
import { firestoreOperation } from '../utils/firestoreWrapper';

export const saveUserPreferences = async (userId, preferences) => {
  try {
    const userPrefsRef = doc(db, 'userPreferences', userId);
    const keySetDoc = `saveUserPreferences_setDoc_${userId}`;
    await firestoreOperation(
      'setDoc',
      keySetDoc,
      'saveUserPreferences',
      {},
      userPrefsRef,
      preferences,
      { merge: true }
    );
  } catch (error) {
    console.error('Error saving user preferences:', error);
  }
};

export const getUserPreferences = async (userId) => {
  try {
    const userPrefsRef = doc(db, 'userPreferences', userId);
    const keyGetDoc = `getUserPreferences_getDoc_${userId}`;
    const docSnap = await firestoreOperation(
      'getDoc',
      keyGetDoc,
      'getUserPreferences',
      {
        useCache: true,
        transformResult: (docSnap) => ({
          exists: docSnap.exists(),
          data: docSnap.exists() ? docSnap.data() : null,
        }),
      },
      userPrefsRef
    );
    if (docSnap.exists) {
      return docSnap.data;
    } else {
      return { emailNotifications: true };
    }
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return { emailNotifications: true };
  }
};

export const updateUserProfileInFirestore = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    const keySetDoc = `updateUserProfileInFirestore_setDoc_${userId}`;
    await firestoreOperation(
      'setDoc',
      keySetDoc,
      'updateUserProfileInFirestore',
      {},
      userRef,
      profileData,
      { merge: true }
    );
  } catch (error) {
    console.error('Error updating user profile in Firestore:', error);
  }
};

export const getUserProfileFromFirestore = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const keyGetDoc = `getUserProfileFromFirestore_getDoc_${userId}`;
    const snapshot = await firestoreOperation(
      'getDoc',
      keyGetDoc,
      'getUserProfileFromFirestore',
      {
        useCache: true,
        transformResult: (docSnap) => ({
          exists: docSnap.exists(),
          data: docSnap.exists() ? docSnap.data() : null,
        }),
      },
      userRef
    );
    if (snapshot.exists) {
      return snapshot.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile from Firestore:', error);
    return null;
  }
};
