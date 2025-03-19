import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  DocumentData,
  QuerySnapshot,
  WithFieldValue,
  DocumentReference,
  CollectionReference,
} from 'firebase/firestore';
import { db } from './firebase';

// Example collection names
export const COLLECTIONS = {
  USERS: 'users',
  MENU_ITEMS: 'menuItems',
  ORDERS: 'orders',
  CART: 'cart',
} as const;

// Helper function to create a typed document reference
function getTypedDoc<T>(
  collectionName: string,
  docId: string
): DocumentReference<T> {
  return doc(collection(db, collectionName) as CollectionReference<T>, docId);
}

// Generic function to add a document to a collection
export const addDocument = async <T>(
  collectionName: string,
  docId: string,
  data: WithFieldValue<T>
) => {
  try {
    const docRef = getTypedDoc<T>(collectionName, docId);
    await setDoc(docRef, data);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Generic function to get a document
export const getDocument = async <T>(
  collectionName: string,
  docId: string
) => {
  try {
    const docRef = getTypedDoc<T>(collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    }
    return { success: false, error: 'Document not found' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Generic function to update a document
export const updateDocument = async <T>(
  collectionName: string,
  docId: string,
  data: Partial<WithFieldValue<T>>
) => {
  try {
    const docRef = getTypedDoc<T>(collectionName, docId);
    await updateDoc(docRef, data);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Generic function to delete a document
export const deleteDocument = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Generic function to get all documents from a collection
export const getAllDocuments = async <T>(collectionName: string) => {
  try {
    const collectionRef = collection(db, collectionName) as CollectionReference<T>;
    const querySnapshot = await getDocs(collectionRef);
    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { success: true, data: documents };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Generic function to listen to real-time updates
export const subscribeToCollection = <T>(
  collectionName: string,
  callback: (data: QuerySnapshot<T>) => void
) => {
  const collectionRef = collection(db, collectionName) as CollectionReference<T>;
  return onSnapshot(collectionRef, callback);
};

// Example of a query function
export const queryDocuments = async <T>(
  collectionName: string,
  field: keyof T,
  operator: '==' | '>' | '<' | '>=' | '<=',
  value: any
) => {
  try {
    const collectionRef = collection(db, collectionName) as CollectionReference<T>;
    const q = query(
      collectionRef,
      where(field as string, operator, value)
    );
    const querySnapshot = await getDocs(q);
    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { success: true, data: documents };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
