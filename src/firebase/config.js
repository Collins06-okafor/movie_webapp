import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Add this import

const firebaseConfig = {
  apiKey: "AIzaSyA17ROQ1uzTjUyg9mLmyQ-Q81FT7YN4zv8",
  authDomain: "movie-webapp-aa873.firebaseapp.com",
  projectId: "movie-webapp-aa873",
  storageBucket: "movie-webapp-aa873.appspot.com",
  messagingSenderId: "977335822117",
  appId: "1:977335822117:web:e7b5bc5210aded91579ccc"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); // Add this export