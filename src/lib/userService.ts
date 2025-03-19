import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Get user profile from Firestore
export const getUserProfile = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
};

// Create user profile in Firestore
export const createUserProfile = async (uid: string, data: any) => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, { ...data, createdAt: serverTimestamp() });
};

// Update last login timestamp
export const updateLastLogin = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { lastLogin: serverTimestamp() });
};
