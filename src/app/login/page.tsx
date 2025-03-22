// page.tsx (or page.js)
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "../firebase"; // Adjust path if needed
import { doc, getDoc } from "firebase/firestore";
import bcrypt from "bcryptjs";

const LoginPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Get role from query params on the client side
    const queryRole = new URLSearchParams(window.location.search).get("role");
    if (queryRole) {
      setRole(queryRole);
    }

    const sessionId = localStorage.getItem("session-id");
    if (sessionId) {
      router.push("/");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Username and password cannot be empty.");
      return;
    }

    try {
      let userDoc;
      let passwordMatch = false;

      if (role === "admin") {
        userDoc = await getDoc(doc(db, "admin", username));
        if (!userDoc.exists()) {
          setError("Admin not found.");
          return;
        }

        const userData = userDoc.data();
        passwordMatch = password === userData.password; // Directly compare plain text password
      } else if (role === "user") {
        userDoc = await getDoc(doc(db, "user_detail", username));
        if (!userDoc.exists()) {
          setError("User not found.");
          return;
        }

        const userData = userDoc.data();
        passwordMatch = await bcrypt.compare(password, userData.password); // Compare hashed password
      } else {
        setError("Invalid role.");
        return;
      }

      if (!passwordMatch) {
        setError("Invalid username or password.");
        return;
      }

      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Session creation failed");

      localStorage.setItem("session-id", data.sessionId);
      router.push(role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error during login.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black bg-opacity-80 backdrop-blur-lg">
      <div className="card w-96 p-6 rounded-xl shadow-2xl bg-gray-900 bg-opacity-60">
        <h2 className="text-2xl font-bold text-center text-white mb-4">Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="input w-full"
          />
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input w-full"
          />
          <button type="submit" className="btn w-full bg-blue-600 hover:bg-blue-500 text-white">
            Login
          </button>
        </form>

        {error && <p className="text-red-400 text-sm mt-3 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default LoginPage;
