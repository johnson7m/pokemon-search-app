import { db } from '../firebase';
import { doc } from 'firebase/firestore';
import { firestoreOperation } from '../utils/firestoreWrapper';
import { getFavoritesCount } from './firestoreService';

const USER_STATS_COLLECTION = 'userStatistics';

export const getUserStats = async (userId) => {
  try {
    const userStatsRef = doc(db, USER_STATS_COLLECTION, userId);
    const key = `getUserStats_${userId}`;
    // Use caching for getDoc; transform snapshot into plain object.
    let userStatsData = await firestoreOperation(
      'getDoc',
      key,
      'getUserStats',
      {
        useCache: true,
        transformResult: (docSnap) => ({
          exists: docSnap.exists(),
          data: docSnap.exists() ? docSnap.data() : null,
        }),
      },
      userStatsRef
    );

    if (!userStatsData.exists) {
      const existingFavorites = await getFavoritesCount(userId);
      const initialStats = {
        level: 1,
        xp: 0,
        achievements: [],
        badges: [],
        totalSearches: 0,
        totalFavorites: existingFavorites,
        totalTimeSpent: 0,
      };
      const keySetDoc = `getUserStats_set_${userId}`;
      await firestoreOperation(
        'setDoc',
        keySetDoc,
        'getUserStats',
        {},
        userStatsRef,
        initialStats
      );
      userStatsData = await firestoreOperation(
        'getDoc',
        key,
        'getUserStats',
        {
          useCache: true,
          transformResult: (docSnap) => ({
            exists: docSnap.exists(),
            data: docSnap.exists() ? docSnap.data() : null,
          }),
        },
        userStatsRef
      );
    }

    const data = userStatsData.data || {};
    let {
      level = 1,
      xp = 0,
      achievements = [],
      badges = [],
      totalSearches = 0,
      totalFavorites = 0,
      totalTimeSpent = 0,
    } = data;

    const actualCount = await getFavoritesCount(userId);
    if (actualCount > totalFavorites) {
      totalFavorites = actualCount;
      const keyUpdateDoc = `getUserStats_update_${userId}`;
      await firestoreOperation(
        'updateDoc',
        keyUpdateDoc,
        'getUserStats',
        {},
        userStatsRef,
        { totalFavorites }
      );
    }

    return { level, xp, achievements, badges, totalSearches, totalFavorites, totalTimeSpent };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return null;
  }
};

export const addXp = async (userId, xpAmount = 0, triggerToast = null) => {
  try {
    const userStatsRef = doc(db, USER_STATS_COLLECTION, userId);
    const keyGetDoc = `addXp_getDoc_${userId}`;
    let userStatsData = await firestoreOperation(
      'getDoc',
      keyGetDoc,
      'addXp',
      {
        useCache: true,
        transformResult: (docSnap) => ({
          exists: docSnap.exists(),
          data: docSnap.exists() ? docSnap.data() : null,
        }),
      },
      userStatsRef
    );

    if (!userStatsData.exists) {
      const initData = {
        level: 1,
        xp: 0,
        achievements: [],
        badges: [],
        totalSearches: 0,
        totalFavorites: 0,
        totalTimeSpent: 0,
      };
      const keySetDoc = `addXp_setDoc_${userId}`;
      await firestoreOperation(
        'setDoc',
        keySetDoc,
        'addXp',
        {},
        userStatsRef,
        initData
      );
      userStatsData = await firestoreOperation(
        'getDoc',
        keyGetDoc,
        'addXp',
        {
          useCache: true,
          transformResult: (docSnap) => ({
            exists: docSnap.exists(),
            data: docSnap.exists() ? docSnap.data() : null,
          }),
        },
        userStatsRef
      );
    }

    const currentStats = userStatsData.data || {};
    let { xp = 0, level = 1, achievements = [], badges = [], totalSearches = 0, totalFavorites = 0, totalTimeSpent = 0 } = currentStats;
    const oldAchievements = [...achievements];

    xp += xpAmount;
    while (xp >= xpNeededForLevel(level + 1)) {
      level++;
      achievements = maybeUnlockAchievement(achievements, `level_${level}`);
    }

    const keyUpdateDoc = `addXp_updateDoc_${userId}`;
    await firestoreOperation(
      'updateDoc',
      keyUpdateDoc,
      'addXp',
      {},
      userStatsRef,
      { xp, level, achievements, badges, totalSearches, totalFavorites, totalTimeSpent }
    );

    if (triggerToast) {
      if (xpAmount > 0) {
        triggerToast(`+${xpAmount}`, 'xp');
      }
      const newlyUnlocked = achievements.filter((ach) => !oldAchievements.includes(ach));
      if (newlyUnlocked.length > 0) {
        newlyUnlocked.forEach((ach) => {
          triggerToast(`Achievement unlocked: ${ach}`, 'info');
        });
      }
    }
  } catch (error) {
    console.error('Error adding XP:', error);
  }
};

export const updateUserStats = async (userId, partialData = {}) => {
  try {
    const userStatsRef = doc(db, USER_STATS_COLLECTION, userId);
    const keyUpdateDoc = `updateUserStats_${userId}_${Date.now()}`;
    await firestoreOperation(
      'updateDoc',
      keyUpdateDoc,
      'updateUserStats',
      {},
      userStatsRef,
      partialData
    );
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
};

const xpNeededForLevel = (lvl) => {
  return 100 * (lvl - 1) ** 2 || 50;
};

const maybeUnlockAchievement = (achievementsArray, achievementKey) => {
  if (!achievementsArray.includes(achievementKey)) {
    return [...achievementsArray, achievementKey];
  }
  return achievementsArray;
};
