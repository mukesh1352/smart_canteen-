import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBvVFrOnaJRiPd5LxEMA3KRWBFDyCpRBzE",
    authDomain: "smartcanteen-edff3.firebaseapp.com",
    databaseURL: "https://smartcanteen-edff3-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smartcanteen-edff3",
    storageBucket: "smartcanteen-edff3.firebasestorage.app",
    messagingSenderId: "439796871452",
    appId: "1:439796871452:web:d07770e57230423f044ad9",
    measurementId: "G-JWK33GEMJE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, GoogleAuthProvider, signInWithPopup, setDoc, doc };
