"use client";
import { useState } from "react";
import { db } from "../firebase"; // Import Firebase modules
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

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
