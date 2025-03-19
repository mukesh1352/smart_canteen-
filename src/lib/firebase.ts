import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBvVFrOnaJRiPd5LxEMA3KRWBFDyCpRBzE",
  authDomain: "smartcanteen-edff3.firebaseapp.com",
  projectId: "smartcanteen-edff3",
  storageBucket: "smartcanteen-edff3.firebasestorage.app",
  messagingSenderId: "439796871452",
  appId: "1:439796871452:web:d07770e57230423f044ad9",
  measurementId: "G-JWK33GEMJE"
};
// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { app, auth };
