"use client";
import { useState } from "react";
import { auth, signInWithPopup, db, setDoc, doc, GoogleAuthProvider } from "../firebase";

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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

    try {
      const userDetailRef = doc(db, "user_detail", username);
      await setDoc(userDetailRef, {
        username: username,
        password: password, // ⚠️ Store securely (use hashing in production)
        createdAt: new Date().toISOString(),
      });

      alert("Username & Password saved successfully!");
      
      // Redirect to home page after successful signup
      window.location.href = "/";

      // Clear fields after successful submission
      setUsername("");
      setPassword("");
      setError(null);
    } catch (err) {
      console.error("Firestore Error:", err);
      setError(err instanceof Error ? err.message : "Error saving credentials.");
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>

      {/* Username & Password Input */}
      <input 
        type="text" 
        placeholder="Enter Username" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
      />
      <input 
        type="password" 
        placeholder="Enter Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <button onClick={handleSaveCredentials}>Save Username & Password</button>

      {/* Google Sign-in Button */}
      <button onClick={handleGoogleLogin}>Sign in with Google</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
