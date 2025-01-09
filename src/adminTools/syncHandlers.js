import { db } from '../firebase';
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  setDoc,
  increment,
} from 'firebase/firestore';

export const syncWaterCounts = async () => {
  try {
    const favoritesRef = collection(db, 'favorites');
    const q = query(favoritesRef, where('pokemon.types', 'array-contains', 'water'));
    const querySnapshot = await getDocs(q);

    const userWaterCounts = {};

    querySnapshot.forEach((docSnapshot) => {
      const { userId } = docSnapshot.data();
      if (userWaterCounts[userId]) {
        userWaterCounts[userId]++;
      } else {
        userWaterCounts[userId] = 1;
      }
    });

    const userStatsRef = collection(db, 'userStatistics');
    for (const [userId, waterCount] of Object.entries(userWaterCounts)) {
      const userDocRef = doc(userStatsRef, userId);

      // Use setDoc if the document doesn't exist, otherwise updateDoc
      await setDoc(
        userDocRef,
        { waterCount },
        { merge: true } // merge ensures we don't overwrite existing fields
      );
    }

    console.log('Water counts synced successfully.');
    console.log(`Processed ${Object.keys(userWaterCounts).length} users.`);

  } catch (error) {
    console.error('Error syncing water counts:', error);
    throw error;
  }
};
