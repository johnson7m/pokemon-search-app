// src/contexts/UserStatsContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';            // Your Firebase config
import { useAuthContext } from './AuthContext'; // So we know which user is logged in
import { getUserStats } from '../services/statisticsService'; 
  // We'll call getUserStats if the doc doesn't exist, to initialize it

const UserStatsContext = createContext(null);

export const UserStatsProvider = ({ children }) => {
  const { user } = useAuthContext();

  const [stats, setStats] = useState(null); // Will store { level, xp, badges, ... }

  useEffect(() => {
    // If no user, reset stats
    if (!user) {
      setStats(null);
      return;
    }

    // 1) Real-time listener on userStatistics/{user.uid}
    const userStatsRef = doc(db, 'userStatistics', user.uid);
    const unsubscribe = onSnapshot(userStatsRef, async (snapshot) => {
      if (snapshot.exists()) {
        // If doc exists, set the snapshot data as stats
        setStats(snapshot.data());
      } else {
        // If doc doesn't exist, call your existing getUserStats logic to initialize it
        const initialStats = await getUserStats(user.uid);
        setStats(initialStats);
      }
    });

    // Cleanup the listener on unmount or user change
    return () => unsubscribe();
  }, [user]);

  return (
    <UserStatsContext.Provider value={{ stats }}>
      {children}
    </UserStatsContext.Provider>
  );
};

export const useUserStatsContext = () => {
  const context = useContext(UserStatsContext);
  if (!context) {
    throw new Error('useUserStatsContext must be used within a UserStatsProvider');
  }
  return context;
};
