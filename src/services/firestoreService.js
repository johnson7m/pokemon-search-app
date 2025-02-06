import { db, auth } from '../firebase';
import {
  collection,
  query,
  where,
  orderBy,
  doc,
  limit,
  increment,
} from 'firebase/firestore';
import { firestoreOperation } from '../utils/firestoreWrapper';
import { clearCachedFirestoreData } from '../utils/firestoreCache';
import { addXp, updateUserStats } from './statisticsService';

// Sample tasks array (unchanged)
const sampleTasks = [
  {
    title: "Splash in the Water",
    description: "Search for 3 Water-type Pokémon today!",
    taskType: "daily",
    difficulty: "easy",
    xpReward: 50,
    multiGoal: false,
    progressModules: {
      main: {
        progressType: "search",
        progressGoal: 3,
        searchCriteria: { requiredType: 'water' },
      },
    },
  },
  {
    title: "Johto Gym Trivia",
    description: "Answer the Johto region trivia question correctly.",
    taskType: "daily",
    category: "trivia",
    difficulty: "medium",
    xpReward: 75,
    question: "Who is the 4th gym leader in Johto?",
    options: ["Morty", "Whitney", "Jasmine", "Eusine"],
    correctAnswer: "Morty",
  },
  {
    title: "Rise in the Ranks",
    description: "Increase your 'WaterEnjoyers' leaderboard rank by 1.",
    taskType: "daily",
    category: "challenge",
    difficulty: "hard",
    xpReward: 100,
    leaderboardName: "WaterEnjoyers",
    rankChangeGoal: 1,
  },
  {
    title: "Evolution Marathon",
    description: "Search for 10 Pokémon with 2-stage evolutions within the week.",
    taskType: "weekly",
    category: "search",
    difficulty: "medium",
    xpReward: 200,
    progressModules: {
      progressType: "search",
      progressGoal: 10,
      searchCriteria: { evolutionStagesAllowed: [2] },
    },
  },
  {
    title: "Kanto Knowledge",
    description: "Answer 3 random Kanto trivia questions correctly this week.",
    taskType: "weekly",
    category: "trivia",
    difficulty: "hard",
    xpReward: 250,
    questionCountGoal: 3,
  },
  {
    title: "Monthly Mega Challenge",
    description:
      "Accumulate 25 water type searches and 25 fire type searches in 30 days.",
    taskType: "monthly",
    difficulty: "hard",
    xpReward: 500,
    multiGoal: true,
    progressModules: {
      waterSearch: {
        progressType: "search",
        progressGoal: 25,
        currentProgress: 0,
        isCompleted: false,
        searchCriteria: { requiredType: "water" },
      },
      fireSearch: {
        progressType: "search",
        progressGoal: 25,
        currentProgress: 0,
        isCompleted: false,
        searchCriteria: { requiredType: "fire" },
      },
    },
  },
];

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
    // Disable caching for this query because the QuerySnapshot object isn’t cloneable.
    const keyGetDocs = `toggleFavoritePokemon_getDocs_${user.uid}_${pokemon.id}`;
    const querySnapshot = await firestoreOperation(
      'getDocs',
      keyGetDocs,
      'toggleFavoritePokemon',
      { useCache: false },
      q
    );

    if (!querySnapshot.empty) {
      console.log('toggleFavoritePokemon => removing favorite');
      querySnapshot.forEach(async (docSnapshot) => {
        const keyDeleteDoc = `toggleFavoritePokemon_deleteDoc_${docSnapshot.id}`;
        await firestoreOperation(
          'deleteDoc',
          keyDeleteDoc,
          'toggleFavoritePokemon',
          {},
          docSnapshot.ref
        );
      });
      // Invalidate affected caches.
      await clearCachedFirestoreData(`getFavoritePokemon_${user.uid}`);
      await clearCachedFirestoreData(`getFavoritesCount_${user.uid}`);
      return { success: true, message: 'Removed from favorites!' };
    } else {
      console.log('toggleFavoritePokemon => adding favorite =>', pokemon.name);
      const simplifiedPokemon = {
        name: pokemon.name,
        id: pokemon.id,
        sprites: pokemon.sprites,
        types: pokemon.types.map((typeInfo) => typeInfo.type.name),
      };
      const keyAddDoc = `toggleFavoritePokemon_addDoc_${user.uid}_${pokemon.id}`;
      await firestoreOperation(
        'addDoc',
        keyAddDoc,
        'toggleFavoritePokemon',
        {},
        collection(db, 'favorites'),
        {
          userId: user.uid,
          pokemon: simplifiedPokemon,
          timestamp: new Date(),
        }
      );

      // Award XP and update stats.
      await addXp(user.uid, 15, xpTrigger);
      await updateUserStats(user.uid, { totalFavorites: increment(1) });

      // Optionally update waterCount.
      const pokemonTypes = pokemon.types.map((typeInfo) => typeInfo.type.name);
      console.log('toggleFavoritePokemon => pokemon types:', pokemonTypes);
      if (pokemonTypes.includes('water')) {
        await updateUserStats(user.uid, { waterCount: increment(1) });
      }
      // Invalidate caches that rely on favorites.
      await clearCachedFirestoreData(`getFavoritePokemon_${user.uid}`);
      await clearCachedFirestoreData(`getFavoritesCount_${user.uid}`);

      return { success: true, message: 'Added to favorites!' };
    }
  } catch (error) {
    console.error('Error toggling favorite Pokemon:', error);
    return { success: false, message: 'Error updating favorites.' };
  }
};

export const removeFavoritePokemon = async (pokemonName) => {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', user.uid),
      where('pokemon.name', '==', pokemonName.name)
    );
    const keyGetDocs = `removeFavoritePokemon_getDocs_${user.uid}_${pokemonName.name}`;
    const querySnapshot = await firestoreOperation(
      'getDocs',
      keyGetDocs,
      'removeFavoritePokemon',
      { useCache: true },
      q
    );
    querySnapshot.forEach(async (docSnapshot) => {
      const keyDeleteDoc = `removeFavoritePokemon_deleteDoc_${docSnapshot.id}`;
      await firestoreOperation(
        'deleteDoc',
        keyDeleteDoc,
        'removeFavoritePokemon',
        {},
        doc(db, 'favorites', docSnapshot.id)
      );
    });
    // Invalidate caches.
    await clearCachedFirestoreData(`getFavoritePokemon_${user.uid}`);
    await clearCachedFirestoreData(`getFavoritesCount_${user.uid}`);
  } catch (error) {
    console.error('Error removing favorite Pokemon:', error);
  }
};

export const saveSearchHistory = async (searchTerm, triggerToast) => {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const keyAddDoc = `saveSearchHistory_addDoc_${user.uid}_${Date.now()}`;
    await firestoreOperation(
      'addDoc',
      keyAddDoc,
      'saveSearchHistory',
      {},
      collection(db, 'searchHistory'),
      {
        userId: user.uid,
        searchTerm,
        timestamp: new Date(),
      }
    );
    // Award XP and update stats.
    await addXp(user.uid, 10, triggerToast);
    await updateUserStats(user.uid, {
      totalSearches: increment(1),
      totalTimeSpent: increment(0.5),
    });
    // Invalidate search history cache.
    await clearCachedFirestoreData(`getSearchHistory_${user.uid}`);
    await pruneOldSearchHistory();
  } catch (error) {
    console.error('Error saving search history:', error);
  }
};

export const saveSearchCriteria = async (searchCriteria) => {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const keyAddDoc = `saveSearchCriteria_addDoc_${user.uid}_${Date.now()}`;
    await firestoreOperation(
      'addDoc',
      keyAddDoc,
      'saveSearchCriteria',
      {},
      collection(db, 'savedSearches'),
      {
        userId: user.uid,
        searchCriteria,
        timestamp: new Date(),
      }
    );
  } catch (error) {
    console.error('Error saving search criteria:', error);
  }
};

export const pruneOldSearchHistory = async () => {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const q = query(
      collection(db, 'searchHistory'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
    const keyGetDocs = `pruneOldSearchHistory_getDocs_${user.uid}`;
    const querySnapshot = await firestoreOperation(
      'getDocs',
      keyGetDocs,
      'pruneOldSearchHistory',
      { useCache: false },
      q
    );
    const historyItems = querySnapshot.docs;
    const maxSearchHistoryItems = 30;
    if (historyItems.length > maxSearchHistoryItems) {
      const itemsToDelete = historyItems.slice(maxSearchHistoryItems);
      for (const docSnapshot of itemsToDelete) {
        const keyDeleteDoc = `pruneOldSearchHistory_deleteDoc_${docSnapshot.id}`;
        await firestoreOperation(
          'deleteDoc',
          keyDeleteDoc,
          'pruneOldSearchHistory',
          {},
          docSnapshot.ref
        );
      }
      // Invalidate search history cache.
      await clearCachedFirestoreData(`getSearchHistory_${user.uid}`);
    }
  } catch (error) {
    console.error('Error pruning old search history:', error);
  }
};

export const getSearchHistory = async () => {
  const user = auth.currentUser;
  if (!user) return [];
  try {
    const key = `getSearchHistory_${user.uid}`;
    const q = query(
      collection(db, 'searchHistory'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(30)
    );
    const history = await firestoreOperation(
      'getDocs',
      key,
      'getSearchHistory',
      {
        useCache: true,
        transformResult: (querySnapshot) =>
          querySnapshot.docs.map((doc) => doc.data().searchTerm),
      },
      q
    );
    return history;
  } catch (error) {
    console.error('Error getting search history:', error);
    return [];
  }
};

export const saveFavoritePokemon = async (pokemon) => {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', user.uid),
      where('pokemon.name', '==', pokemon.name)
    );
    const keyGetDocs = `saveFavoritePokemon_getDocs_${user.uid}_${pokemon.name}`;
    const querySnapshot = await firestoreOperation(
      'getDocs',
      keyGetDocs,
      'saveFavoritePokemon',
      { useCache: true },
      q
    );
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
    const keyAddDoc = `saveFavoritePokemon_addDoc_${user.uid}_${pokemon.name}`;
    await firestoreOperation(
      'addDoc',
      keyAddDoc,
      'saveFavoritePokemon',
      {},
      collection(db, 'favorites'),
      {
        userId: user.uid,
        pokemon: simplifiedPokemon,
        timestamp: new Date(),
      }
    );
    // Invalidate favorites caches.
    await clearCachedFirestoreData(`getFavoritePokemon_${user.uid}`);
    await clearCachedFirestoreData(`getFavoritesCount_${user.uid}`);
  } catch (error) {
    console.error('Error saving favorite Pokemon:', error);
  }
};

export const getFavoritePokemon = async () => {
  const user = auth.currentUser;
  if (!user) return [];
  try {
    const key = `getFavoritePokemon_${user.uid}`;
    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
    const favorites = await firestoreOperation(
      'getDocs',
      key,
      'getFavoritePokemon',
      {
        useCache: true,
        transformResult: (querySnapshot) =>
          querySnapshot.docs.map((doc) => doc.data().pokemon),
      },
      q
    );
    return favorites;
  } catch (error) {
    console.error('Error getting favorite Pokémon:', error);
    return [];
  }
};

export const getFavoritesCount = async (userId) => {
  try {
    const key = `getFavoritesCount_${userId}`;
    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', userId)
    );
    const count = await firestoreOperation(
      'getDocs',
      key,
      'getFavoritesCount',
      {
        useCache: true,
        transformResult: (querySnapshot) => querySnapshot.size,
      },
      q
    );
    return count;
  } catch (error) {
    console.error('Error getting favorites count:', error);
    return 0;
  }
};

export const seedSampleTasks = async () => {
  try {
    const tasksRef = collection(db, 'tasks');
    for (const task of sampleTasks) {
      const keyAddDoc = `seedSampleTasks_addDoc_${task.title}_${Date.now()}`;
      await firestoreOperation(
        'addDoc',
        keyAddDoc,
        'seedSampleTasks',
        {},
        tasksRef,
        task
      );
      console.log('Seeded task:', task.title);
    }
    console.log('All sample tasks seeded successfully!');
  } catch (error) {
    console.error('Error seeding sample tasks:', error);
  }
};
