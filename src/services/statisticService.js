// src/services/statisticsService.js
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

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
    const totalTimeSpent = totalSearches * 0.5; // Assume 0.5 minutes per search

    return { totalSearches, totalFavorites, totalTimeSpent };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return null;
  }
};
