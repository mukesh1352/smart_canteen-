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
    e.preventDefault();

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

      // Redirect to login page after successful signup
      window.location.href = "/login";

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
    <div className="flex justify-center items-center min-h-screen bg-black bg-opacity-80 backdrop-blur-lg">
      <div className="card w-96 p-6 rounded-xl shadow-2xl bg-gray-900 bg-opacity-60 backdrop-blur-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-center text-white mb-4">Sign Up</h2>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="input input-bordered w-full bg-gray-800 text-white border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-400/50"
          />
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input input-bordered w-full bg-gray-800 text-white border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-400/50"
          />
          <button type="submit" className="btn w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all duration-300">
            Sign Up
          </button>
        </form>

        {error && <p className="text-red-400 text-sm mt-3 text-center">{error}</p>}

        <p className="text-center text-sm mt-3 text-gray-400">
          Already have an account?{" "}
          <a href="/login" className="text-blue-400 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
