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
    <div className="flex justify-center items-center min-h-screen bg-black bg-opacity-80 backdrop-blur-lg">
      <div className="card w-96 p-6 rounded-xl shadow-2xl bg-gray-900 bg-opacity-60 backdrop-blur-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-center text-white mb-4">Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">
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
            Login
          </button>
        </form>

        {error && <p className="text-red-400 text-sm mt-3 text-center">{error}</p>}

        <p className="text-center text-sm mt-3 text-gray-400">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-400 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
