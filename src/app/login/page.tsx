"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import bcrypt from "bcryptjs";

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Username and password cannot be empty.");
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, "user_detail", username));
      if (!userDoc.exists()) throw new Error("Invalid username or password.");
      const userData = userDoc.data();

      if (!(await bcrypt.compare(password, userData.password))) {
        throw new Error("Invalid username or password.");
      }

      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) throw new Error("Session creation failed");

      const data = await response.json();
      localStorage.setItem("session-id", data.sessionId);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error during login.");
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
