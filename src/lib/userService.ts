import { 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  role: 'student' | 'staff' | 'admin';
  createdAt: any;
  lastLogin: any;
  isActive: boolean;
  balance?: number;
}

export const createUserProfile = async (
  uid: string,
  email: string,
  additionalData?: Partial<UserProfile>
) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userData: UserProfile = {
      uid,
      email,
      role: 'student', // default role
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      isActive: true,
      balance: 0,
      ...additionalData
    };

    await setDoc(userRef, userData);
    return { success: true, data: userData };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (uid: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { success: true, data: userSnap.data() as UserProfile };
    }
    return { success: false, error: 'User not found' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (
  uid: string,
  updates: Partial<UserProfile>
) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      lastLogin: serverTimestamp()
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateLastLogin = async (uid: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      lastLogin: serverTimestamp()
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
