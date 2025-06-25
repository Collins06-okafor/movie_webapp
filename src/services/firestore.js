// src/services/firestore.js
import { getFirestore, collection, addDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { auth } from '../firebase/config';

const db = getFirestore();

// Add movie to watchlist
export const addToWatchlist = async (movie) => {
  const user = auth.currentUser;
  if (!user) return;

  await addDoc(collection(db, 'watchlist'), {
    uid: user.uid,
    ...movie,
  });
};

// Remove movie from watchlist by its document ID
export const removeFromWatchlist = async (docId) => {
  await deleteDoc(doc(db, 'watchlist', docId));
};

// Get user's watchlist
export const getWatchlist = async () => {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(collection(db, 'watchlist'), where('uid', '==', user.uid));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};
