"use client";
import { useEffect, useState } from "react";

interface Session {
  username: string;
  loggedIn: boolean;
}

export default function ProtectedPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // New loading state

  useEffect(() => {
    const checkSession = async () => {
      const sessionId = localStorage.getItem("session-id");
      if (!sessionId) {
        logoutUser();
        return;
      }

      try {
        const response = await fetch("/api/session", {
          method: "GET",
          headers: { "session-id": sessionId },
        });

        const data = await response.json();

        if (!response.ok || data.logout) {
          logoutUser(); // Handle session expiration
          return;
        }

        setSession(data.session);
      } catch (error) {
        console.error("Error checking session:", error);
        logoutUser(); // Logout on error
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Logout function (clears session and redirects)
  const logoutUser = () => {
    localStorage.removeItem("session-id");
    window.location.href = "/login";
  };

  if (loading) {
    return <h1>Checking session...</h1>;
  }

  return session ? <h1>Welcome, {session.username}!</h1> : null;
}
