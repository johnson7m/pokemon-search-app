// src/services/userService.js
import { db } from '../firebase';
import { doc, getDoc, setDoc} from 'firebase/firestore';

export const saveUserPreferences = async (userId, preferences) => {
    try {
      const userPrefsRef = doc(db, 'userPreferences', userId);
      await setDoc(userPrefsRef, preferences);
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  };
  
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

  