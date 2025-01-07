// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyA7d3GTlBdPoLvoEqLreDkPA5zzr1r3sKM",
    authDomain: "pokemon-search-index.firebaseapp.com",
    projectId: "pokemon-search-index",
    storageBucket: "pokemon-search-index.appspot.com",
    messagingSenderId: "541889287128",
    appId: "1:541889287128:web:06e077a43ef0011a2818ad",
    measurementId: "G-KJNJWF4YFZ"
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
