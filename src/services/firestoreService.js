// src/services/firestoreService.js
import { db, auth } from '../firebase';
import { getFirestore, updateDoc, getDoc, setDoc, collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, limit, DocumentSnapshot } from 'firebase/firestore';





// attempting to refactor favorite functions
export const toggleFavoritePokemon = async (pokemon) => {
    const user = auth.currentUser;
    if (!user) return;
  
    try {
      const q = query(
        collection(db, 'favorites'),
        where('userId', '==', user.uid),
        where('pokemon.id', '==', pokemon.id) // Use id for simplicity
      );
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        // If Pokémon is already in favorites, remove it
        querySnapshot.forEach(async (docSnapshot) => {
          await deleteDoc(docSnapshot.ref);
        });
        return { success: true, message: 'Removed from favorites!' };
      } else {
        // If Pokémon is not in favorites, add it
        const simplifiedPokemon = {
          name: pokemon.name,
          id: pokemon.id,
          sprites: pokemon.sprites,
          types: pokemon.types.map(typeInfo => typeInfo.type.name),
        };
        await addDoc(collection(db, 'favorites'), {
          userId: user.uid,
          pokemon: simplifiedPokemon,
          timestamp: new Date()
        });
        return { success: true, message: 'Added to favorites!' };
      }
    } catch (error) {
      console.error('Error toggling favorite Pokemon:', error);
      return { success: false, message: 'Error updating favorites.' };
    }
  };

// Remove from favorites
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
}

// Save search history to Firestore
export const saveSearchHistory = async (searchTerm) => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await addDoc(collection(db, 'searchHistory'), {
      userId: user.uid,
      searchTerm: searchTerm,
      timestamp: new Date()
    });

    // Prune old search history
    await pruneOldSearchHistory();
  } catch (error) {
    console.error('Error saving search history:', error);
  }
};

// Add this function to save search criteria
export const saveSearchCriteria = async (searchCriteria) => {
    const user = auth.currentUser;
    if (!user) return;
  
    try {
      // Save the search criteria to a new "savedSearches" collection
      await addDoc(collection(db, 'savedSearches'), {
        userId: user.uid,
        searchCriteria: searchCriteria,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error saving search criteria:', error);
    }
  };

// pruning search history
export const pruneOldSearchHistory = async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const q = query(
      collection(db, 'searchHistory'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
    );

    const querySnapshot = await getDocs(q); // Use getDocs instead of getDoc
    const historyItems = querySnapshot.docs;
    const maxSearchHistoryItems = 30;

    if (historyItems.length > maxSearchHistoryItems) {
      // Keep the first maxSearchHistoryItems and delete the rest
      const itemsToDelete = historyItems.slice(maxSearchHistoryItems);
      for (const docSnapshot of itemsToDelete) {
        await deleteDoc(docSnapshot.ref);
      }
    }
  } catch (error) {
    console.error('Error pruning old search history:', error);
  }
};



// Get search history from Firestore
export const getSearchHistory = async () => {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const q = query(
      collection(db, 'searchHistory'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(30), // Limit to 10 entries
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data().searchTerm);
  } catch (error) {
    console.error('Error getting search history:', error);
    return [];
  }
};

// Save favorite Pokemon to Firestore
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

    //Debug: log data sent
    console.log('Saving favorite Pokemon:', pokemon);

    const simplifiedPokemon = {
        name: pokemon.name,
        id: pokemon.id,
        sprites: pokemon.sprites,
        types: pokemon.types.map(typeInfo => typeInfo.type.name),
    }

    await addDoc(collection(db, 'favorites'), {
      userId: user.uid,
      pokemon: simplifiedPokemon,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error saving favorite Pokemon:', error);
  }
};

// Get favorite Pokemon from Firestore
export const getFavoritePokemon = async () => {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data().pokemon);
  } catch (error) {
    console.error('Error getting favorite Pokemon:', error);
    return [];
  }
};


export const getUserStatistics = async (uid) => {
  const db = getFirestore();
  const userStatsRef = doc(db, 'userStatistics', uid);
  const userStatsSnap = await getDoc(userStatsRef);

  if (userStatsSnap.exists()) {
    return userStatsSnap.data();
  } else {
    // Initialize user statistics document if it doesn't exist
    const initialStats = {
      level: 1,
      title: 'New Trainer',
      trophies: [],
      badges: [],
      quizzesCompleted: 0,
      teamsBuilt: 0,
      challengesParticipated: 0,
      searches: 0,
      votesCast: 0,
      featuredPokemon: null,
    };
    await setDoc(userStatsRef, initialStats);
    return initialStats;
  }
};

export const updateUserStatistics = async (uid, data) => {
  const db = getFirestore();
  const userStatsRef = doc(db, 'userStatistics', uid);
  await updateDoc(userStatsRef, data);
};