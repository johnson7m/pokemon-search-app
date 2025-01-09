// src/services/leaderboardService.js
import { db } from '../firebase';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  getDoc,
  where,
} from 'firebase/firestore';

/**
 * Query userStatistics, order by totalFavorites DESC, return top N users
 */
export const getTopFavorites = async (topN = 10) => {
  const userStatsRef = collection(db, 'userStatistics');
  const qUserStats = query(
    userStatsRef,
    orderBy('totalFavorites', 'desc'),
    limit(topN)
  );
  const snapshot = await getDocs(qUserStats);

  // Each doc => doc.id is userId, doc.data() has stats
  const results = [];
  snapshot.forEach((docSnap) => {
    results.push({
      userId: docSnap.id, // user UID
      ...docSnap.data(),  // { totalFavorites, xp, level, etc.}
    });
  });
  return results; // Array sorted desc by totalFavorites
};

/**
 * Query userStatistics, order by badges.length DESC
 * (You might store badges as an array, so we check .length)
 */
export const getTopBadges = async (topN = 10) => {
  // There's no direct "orderBy array length" in Firestore, so
  // you might store badgesCount as a numeric field in userStatistics
  // For demonstration, let's assume there's a "badgesCount" field.
  const userStatsRef = collection(db, 'userStatistics');
  const qUserStats = query(
    userStatsRef,
    orderBy('badgesCount', 'desc'),
    limit(topN)
  );
  const snapshot = await getDocs(qUserStats);

  const results = [];
  snapshot.forEach((docSnap) => {
    results.push({
      userId: docSnap.id,
      ...docSnap.data(),
    });
  });
  return results;
};

/**
 * "Water enjoyers": the top users with the greatest number of "water-type" favorites.
 * We'll assume each userStats doc might store waterTypeFavorites: number.
 * OR we can do a more advanced approach:
 *   - Query the 'favorites' collection
 *   - For each user, count how many have "water" in the types
 *   - Then sort + return top N
 *
 * For demonstration, let's assume there's a 'waterCount' field in userStatistics.
 */
export const getTopWaterEnjoyers = async (topN = 10) => {
  const userStatsRef = collection(db, 'userStatistics');
  const qUserStats = query(
    userStatsRef,
    orderBy('waterCount', 'desc'),
    limit(topN)
  );
  const snapshot = await getDocs(qUserStats);

  const results = [];
  snapshot.forEach((docSnap) => {
    results.push({
      userId: docSnap.id,
      ...docSnap.data(),
    });
  });
  return results;
};
