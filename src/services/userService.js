// src/services/userService.js
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, setDoc} from 'firebase/firestore';

export const getUserStats = async (userId) => {
  try {
    const searchHistoryRef = collection(db, 'searchHistory');
    const favoritesRef = collection(db, 'favorites');

    const searchQuery = query(searchHistoryRef, where('userId', '==', userId));
    const favoritesQuery = query(favoritesRef, where('userId', '==', userId));

    const [searchSnapshot, favoritesSnapshot] = await Promise.all([
      getDocs(searchQuery),
      getDocs(favoritesQuery),
    ]);

    const totalSearches = searchSnapshot.size;
    const totalFavorites = favoritesSnapshot.size;
    // For simplicity, we'll use a static total time spent
    const totalTimeSpent = totalSearches * 0.5; // Assume 0.5 minutes per search

    return { totalSearches, totalFavorites, totalTimeSpent };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return null;
  }
};

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

  