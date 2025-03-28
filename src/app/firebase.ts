import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getDatabase, ref } from "firebase/database"; // ✅ Add Realtime Database

const firebaseConfig = {
  apiKey: "AIzaSyBvF...",
  authDomain: "smartcanteen-edff3.firebaseapp.com",
  databaseURL: "https://smartcanteen-edff3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smartcanteen-edff3",
  storageBucket: "smartcanteen-edff3.appspot.com",
  messagingSenderId: "439796871452",
  appId: "1:439796871452:web:d07770e57230423f044ad9",
  measurementId: "G-JWK33GEMJE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app); // ✅ Add this for Realtime Database

export { auth, db, database, GoogleAuthProvider, signInWithPopup, setDoc, doc, ref }; // ✅ Export `database` & `ref`
