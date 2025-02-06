import { db } from '../firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  doc,
} from 'firebase/firestore';
import { firestoreOperation } from '../utils/firestoreWrapper';

// Caching getDisplayName (using getDoc)
async function getDisplayName(uid) {
  const userRef = doc(db, 'users', uid);
  const keyGetDoc = `getDisplayName_${uid}`;
  // Transform the snapshot into plain data:
  const snap = await firestoreOperation(
    'getDoc',
    keyGetDoc,
    'getDisplayName',
    {
      useCache: true,
      transformResult: (docSnap) => ({ exists: docSnap.exists(), data: docSnap.exists() ? docSnap.data() : null }),
    },
    userRef
  );
  if (snap.exists) {
    const data = snap.data;
    return data.displayName || 'NoName';
  }
  return 'Unknown';
}

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

export const getTopFavorites = async (topN = 10) => {
  const userStatsRef = collection(db, 'userStatistics');
  const qUserStats = query(
    userStatsRef,
    orderBy('totalFavorites', 'desc'),
    limit(topN)
  );
  const key = `getTopFavorites_${topN}`;
  const snapshot = await firestoreOperation(
    'getDocs',
    key,
    'getTopFavorites',
    {
      useCache: true,
      transformResult: (querySnapshot) => {
        const results = [];
        querySnapshot.forEach((docSnap) => {
          results.push({
            userId: docSnap.id,
            ...docSnap.data(),
          });
        });
        return results;
      },
    },
    qUserStats
  );
  return await populateDisplayNames(snapshot);
};

export const getTopBadges = async (topN = 10) => {
  const userStatsRef = collection(db, 'userStatistics');
  const qUserStats = query(
    userStatsRef,
    orderBy('badgesCount', 'desc'),
    limit(topN)
  );
  const key = `getTopBadges_${topN}`;
  const snapshot = await firestoreOperation(
    'getDocs',
    key,
    'getTopBadges',
    {
      useCache: true,
      transformResult: (querySnapshot) => {
        const results = [];
        querySnapshot.forEach((docSnap) => {
          results.push({
            userId: docSnap.id,
            ...docSnap.data(),
          });
        });
        return results;
      },
    },
    qUserStats
  );
  return await populateDisplayNames(snapshot);
};

export const getTopWaterEnjoyers = async (topN = 10) => {
  const userStatsRef = collection(db, 'userStatistics');
  const qUserStats = query(
    userStatsRef,
    orderBy('waterCount', 'desc'),
    limit(topN)
  );
  const key = `getTopWaterEnjoyers_${topN}`;
  const snapshot = await firestoreOperation(
    'getDocs',
    key,
    'getTopWaterEnjoyers',
    {
      useCache: true,
      transformResult: (querySnapshot) => {
        const results = [];
        querySnapshot.forEach((docSnap) => {
          results.push({
            userId: docSnap.id,
            ...docSnap.data(),
          });
        });
        return results;
      },
    },
    qUserStats
  );
  return await populateDisplayNames(snapshot);
};
