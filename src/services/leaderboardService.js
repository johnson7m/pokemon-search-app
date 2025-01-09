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
} from 'firebase/firestore';

/**
 * Fetch the displayName from users/{uid}.
 * If no doc or no displayName, return 'Unknown' or 'NoName'.
 */
async function getDisplayName(uid) {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    const data = snap.data();
    return data.displayName || 'NoName';
  }
  return 'Unknown';
}

/**
 * Populate an array of userStats objects with displayName from "users/{userId}".
 * @param {Array} userStatsArray - e.g. [{ userId, totalFavorites, ... }, ...]
 * @returns {Array} - same array but with { ...userStats, displayName: '...' }
 */
async function populateDisplayNames(userStatsArray) {
  const resultsWithNames = [];
  for (const userStats of userStatsArray) {
    const displayName = await getDisplayName(userStats.userId);
    resultsWithNames.push({
      ...userStats,
      displayName,
    });
  }
  return resultsWithNames;
}

/**
 * 1) Query userStatistics, order by totalFavorites DESC, return top N users.
 *    Then fill in displayName.
 */
export const getTopFavorites = async (topN = 10) => {
  const userStatsRef = collection(db, 'userStatistics');
  const qUserStats = query(
    userStatsRef,
    orderBy('totalFavorites', 'desc'),
    limit(topN)
  );
  const snapshot = await getDocs(qUserStats);

  const results = [];
  snapshot.forEach((docSnap) => {
    results.push({
      userId: docSnap.id, // doc ID is userId
      ...docSnap.data(),
    });
  });

  // Now fill in displayName for each
  return await populateDisplayNames(results);
};

/**
 * 2) Query userStatistics, order by badgesCount DESC, fill in displayName.
 *    (Requires a numeric field "badgesCount" in userStatistics doc if you want to sort.)
 */
export const getTopBadges = async (topN = 10) => {
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

  return await populateDisplayNames(results);
};

/**
 * 3) "Water enjoyers" => top users with "waterCount" numeric field in userStatistics.
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

  return await populateDisplayNames(results);
};
