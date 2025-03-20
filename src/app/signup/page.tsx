"use client";
import { useState } from "react";
import { db, auth, GoogleAuthProvider, signInWithPopup } from "../firebase"; // Import Firebase modules
import { doc, getDoc, setDoc } from "firebase/firestore"; // Firestore functions
import bcrypt from "bcryptjs"; // For password hashing

export default function Signup() {
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // Function to handle username & password signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    if (!username.trim() || !password.trim()) {
      setError("Username and password cannot be empty.");
      return;
    }

    try {
      const userDetailRef = doc(db, "user_detail", username);

      // Check if the username already exists
      const userSnap = await getDoc(userDetailRef);
      if (userSnap.exists()) {
        setError("Username is already taken. Choose a different one.");
        return;
      }

      // Hash the password before storing
      const hashedPassword = await bcrypt.hash(password, 10);

      // Save user details in Firestore
      await setDoc(userDetailRef, {
        username,
        password: hashedPassword, // Securely stored hashed password
        createdAt: new Date().toISOString(),
      });

      alert("Signup successful! Redirecting to home page...");

      // Redirect to home page after successful signup
      window.location.href = "/";

      // Clear input fields
      setUsername("");
      setPassword("");
      setError(null);
    } catch (err) {
      console.error("Firestore Error:", err);
      setError(err instanceof Error ? err.message : "Error during signup.");
    }
  };

  // Google Login Function
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Save user details in "users" collection
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
      });

      // Redirect user after successful login (Google login in this case)
      window.location.href = "/";

    } catch (err) {
      console.error("Google Login Error:", err);
      setError(err instanceof Error ? err.message : "Error signing in with Google.");
    }
  };

  // Save Username & Password to Firestore
  const handleSaveCredentials = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Username and password cannot be empty.");
      return;
    }
  };

  return (
    <div className="signup-container">
      <h1>Signup</h1>

      {/* Signup with Username & Password */}
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
      </form>

      <hr />

      {/* Google Signup Button */}
      <button onClick={handleGoogleLogin}>Sign up with Google</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
