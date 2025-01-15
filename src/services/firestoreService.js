// src/services/firestoreService.js
import { db, auth } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  doc,
  limit,
  increment,
} from 'firebase/firestore';
import { logFirestoreRequest } from '../utils/firestoreLogger';
import { rateLimit } from '../utils/rateLimiter';

// Import addXp or updateUserStats from statisticsService.js
import { addXp, updateUserStats } from './statisticsService';

/**
 * Toggle favorite Pokémon for the current user.
 * If it's newly added, increment totalFavorites and add XP.
 */
export const toggleFavoritePokemon = async (pokemon, xpTrigger) => {
  const user = auth.currentUser;
  if (!user) {
    console.log('toggleFavoritePokemon => no currentUser, aborting');
    return;
  }

  try {
    console.log('toggleFavoritePokemon => user:', user.uid, 'pokemon:', pokemon.name);
    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', user.uid),
      where('pokemon.id', '==', pokemon.id)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Already in favorites => remove
      console.log('toggleFavoritePokemon => removing favorite');
      querySnapshot.forEach(async (docSnapshot) => {
        await deleteDoc(docSnapshot.ref);
      });
      return { success: true, message: 'Removed from favorites!' };
    } else {
      // Not in favorites => add
      console.log('toggleFavoritePokemon => adding favorite =>', pokemon.name);
      const simplifiedPokemon = {
        name: pokemon.name,
        id: pokemon.id,
        sprites: pokemon.sprites,
        types: pokemon.types.map((typeInfo) => typeInfo.type.name),
      };
      await addDoc(collection(db, 'favorites'), {
        userId: user.uid,
        pokemon: simplifiedPokemon,
        timestamp: new Date(),
      });

      // 1) Award XP
      await addXp(user.uid, 15, xpTrigger);

      // 2) Increment totalFavorites
      await updateUserStats(user.uid, {
        totalFavorites: increment(1),
      });

      const pokemonTypes = pokemon.types.map((typeInfo) => typeInfo.type.name);
      console.log('toggleFavoritePokemon => pokemon types:', pokemonTypes);
      if (pokemonTypes.includes('water')) {
        console.log('toggleFavoritePokemon => found water type => incrementing waterCount');
        await updateUserStats(user.uid, {
          waterCount: increment(1),
        });
      }
      

      return { success: true, message: 'Added to favorites!' };
    }
  } catch (error) {
    console.error('Error toggling favorite Pokemon:', error);
    return { success: false, message: 'Error updating favorites.' };
  }
};

/** Remove from favorites (no XP subtracted by default) */
export const removeFavoritePokemon = async (pokemonName) => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', user.uid),
      where('pokemon.name', '==', pokemonName.name)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (DocumentSnapshot) => {
      await deleteDoc(doc(db, 'favorites', DocumentSnapshot.id));
    });
  } catch (error) {
    console.error('Error removing favorite Pokemon:', error);
  }
};

/** Save search history and optionally award XP or increment stats. */
export const saveSearchHistory = async (searchTerm, triggerToast) => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    // Save the actual search
    await addDoc(collection(db, 'searchHistory'), {
      userId: user.uid,
      searchTerm,
      timestamp: new Date(),
    });

    // 1) Award XP for searching
    await addXp(user.uid, 10, triggerToast);

    // 2) Increment totalSearches and totalTimeSpent
    await updateUserStats(user.uid, {
      totalSearches: increment(1),
      // If you consider 0.5 minutes per search, you can do:
      totalTimeSpent: increment(0.5),
    });

    // Prune old search history
    await pruneOldSearchHistory();
  } catch (error) {
    console.error('Error saving search history:', error);
  }
};

/** Save advanced search criteria, etc. */
export const saveSearchCriteria = async (searchCriteria) => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await addDoc(collection(db, 'savedSearches'), {
      userId: user.uid,
      searchCriteria,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error saving search criteria:', error);
  }
};

/** Prune old search history beyond 30 items */
export const pruneOldSearchHistory = async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const q = query(
      collection(db, 'searchHistory'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const historyItems = querySnapshot.docs;
    const maxSearchHistoryItems = 30;

    if (historyItems.length > maxSearchHistoryItems) {
      const itemsToDelete = historyItems.slice(maxSearchHistoryItems);
      for (const docSnapshot of itemsToDelete) {
        await deleteDoc(docSnapshot.ref);
      }
    }
  } catch (error) {
    console.error('Error pruning old search history:', error);
  }
};

/** Retrieve search history from Firestore */
export const getSearchHistory = async () => {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const q = query(
      collection(db, 'searchHistory'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(30)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data().searchTerm);
  } catch (error) {
    console.error('Error getting search history:', error);
    return [];
  }
};

/** Save favorite Pokemon to Firestore (older function—no XP) */
export const saveFavoritePokemon = async (pokemon) => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', user.uid),
      where('pokemon.name', '==', pokemon.name)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      console.log('Pokemon already in favorites!');
      return;
    }

    const simplifiedPokemon = {
      name: pokemon.name,
      id: pokemon.id,
      sprites: pokemon.sprites,
      types: pokemon.types.map((typeInfo) => typeInfo.type.name),
    };

    await addDoc(collection(db, 'favorites'), {
      userId: user.uid,
      pokemon: simplifiedPokemon,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error saving favorite Pokemon:', error);
  }
};

/** Retrieve all favorite Pokemon for the user */
export const getFavoritePokemon = async () => {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const key = `getFavoritePokemon_${user.uid}`;
    return await rateLimit(async () => {
      const q = query(
        collection(db, 'favorites'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await logFirestoreRequest('getDocs', q);
      return querySnapshot.docs.map((doc) => doc.data().pokemon);
    }, key);
  } catch (error) {
    console.error('Error getting favorite Pokémon:', error);
    return [];
  }
};

export const getFavoritesCount = async (userId) => {
  const q = query(
    collection(db, 'favorites'),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  return snap.size;
};
