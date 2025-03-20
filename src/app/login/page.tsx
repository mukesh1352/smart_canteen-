"use client";
import { useState } from "react";
import { db } from "../firebase"; // Import Firebase modules
import { doc, getDoc } from "firebase/firestore"; // Firestore functions
import bcrypt from "bcryptjs"; // For password comparison

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // Function to handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    if (!username.trim() || !password.trim()) {
      setError("Username and password cannot be empty.");
      return;
    }

    try {
      const userDetailRef = doc(db, "user_detail", username);
      const userSnap = await getDoc(userDetailRef);

      if (!userSnap.exists()) {
        setError("Invalid username or password.");
        return;
      }

      const userData = userSnap.data();

      // Compare hashed password
      const isMatch = await bcrypt.compare(password, userData.password);
      if (!isMatch) {
        setError("Invalid username or password.");
        return;
      }

      alert("Login successful! Redirecting to home page...");
      
      // Redirect to home page after successful login
      window.location.href = "/";

      // Clear input fields
      setUsername("");
      setPassword("");
      setError(null);
    } catch (err) {
      console.error("Firestore Error:", err);
      setError(err instanceof Error ? err.message : "Error during login.");
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>

      <form onSubmit={handleLogin}>
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
        <button type="submit">Login</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
