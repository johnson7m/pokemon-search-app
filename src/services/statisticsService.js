// src/services/statisticsService.js
import { db } from '../firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { getFavoritesCount } from './firestoreService';

const USER_STATS_COLLECTION = 'userStatistics';

/**
 * Retrieve the user's stats doc:
 *   level, xp, achievements, badges,
 *   totalSearches, totalFavorites, totalTimeSpent, etc.
 * If the doc doesn't exist, initialize it.
 * 
 * Additionally, if totalFavorites is 0 but the user actually
 * has favorites in Firestore, we do a one-time sync to fix it.
 */
export const getUserStats = async (userId) => {
  try {
    const userStatsRef = doc(db, USER_STATS_COLLECTION, userId);
    let userStatsSnap = await getDoc(userStatsRef);

    // If the doc doesn't exist, create it with an initial totalFavorites
    // that reflects the actual count in Firestore
    if (!userStatsSnap.exists()) {
      const existingFavorites = await getFavoritesCount(userId);
      const initialStats = {
        level: 1,
        xp: 0,
        achievements: [],
        badges: [],
        totalSearches: 0,
        totalFavorites: existingFavorites, // set to the real count
        totalTimeSpent: 0,
      };
      await setDoc(userStatsRef, initialStats);
      userStatsSnap = await getDoc(userStatsRef);
    }

    const data = userStatsSnap.data() || {};
    let {
      level = 1,
      xp = 0,
      achievements = [],
      badges = [],
      totalSearches = 0,
      totalFavorites = 0,
      totalTimeSpent = 0,
    } = data;

    // --- One-time sync logic if user already had favorites but totalFavorites is stuck at 0 ---
    const actualCount = await getFavoritesCount(userId);
    if (actualCount > totalFavorites) {
      totalFavorites = actualCount;
      await updateDoc(userStatsRef, { totalFavorites });
    }

    return {
      level,
      xp,
      achievements,
      badges,
      totalSearches,
      totalFavorites,
      totalTimeSpent,
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return null;
  }
};

/**
 * Adds XP to a user's stats, checks for level-ups,
 * and optionally unlocks new achievements for leveling up.
 *
 * @param {string} userId - The current user ID
 * @param {number} xpAmount - The amount of XP to add
 */
export const addXp = async (userId, xpAmount = 0) => {
  try {
    const userStatsRef = doc(db, USER_STATS_COLLECTION, userId);
    let userStatsSnap = await getDoc(userStatsRef);

    // Initialize if missing
    if (!userStatsSnap.exists()) {
      await setDoc(userStatsRef, {
        level: 1,
        xp: 0,
        achievements: [],
        badges: [],
        totalSearches: 0,
        totalFavorites: 0,
        totalTimeSpent: 0,
      });
      userStatsSnap = await getDoc(userStatsRef);
    }

    const currentStats = userStatsSnap.data() || {};
    let {
      xp = 0,
      level = 1,
      achievements = [],
      badges = [],
      totalSearches = 0,
      totalFavorites = 0,
      totalTimeSpent = 0,
    } = currentStats;

    // Add XP
    xp += xpAmount;

    // Basic leveling logic
    while (xp >= xpNeededForLevel(level + 1)) {
      level++;
      achievements = maybeUnlockAchievement(achievements, `level_${level}`);
    }

    // Update Firestore doc
    await updateDoc(userStatsRef, {
      xp,
      level,
      achievements,
      badges,
      totalSearches,
      totalFavorites,
      totalTimeSpent,
    });
  } catch (error) {
    console.error('Error adding XP:', error);
  }
};

/**
 * Allows partial updates to the user stats doc,
 * e.g. updateUserStats(userId, { totalSearches: increment(1) })
 */
export const updateUserStats = async (userId, partialData = {}) => {
  try {
    const userStatsRef = doc(db, USER_STATS_COLLECTION, userId);
    await updateDoc(userStatsRef, partialData);
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
};

/** 
 * XP threshold formula (customize as needed). 
 * For example, Level 2 = 100 XP, Level 3 = 300 XP, etc.
 */
const xpNeededForLevel = (lvl) => {
  return 100 * (lvl - 1) ** 2 || 50;
};

/**
 * If user doesn't already have `achievementKey`, 
 * add it to achievements array.
 */
const maybeUnlockAchievement = (achievementsArray, achievementKey) => {
  if (!achievementsArray.includes(achievementKey)) {
    return [...achievementsArray, achievementKey];
  }
  return achievementsArray;
};
