"use client";
import { useEffect } from "react";

export default function Logout() {
  useEffect(() => {
    const logoutUser = async () => {
      const sessionId = localStorage.getItem("session-id");
      if (!sessionId) {
        // If no session found, redirect directly to home page
        window.location.href = "/";
        return;
      }

      // Call the API to delete the session
      await fetch("/api/session", {
        method: "DELETE",
        headers: { "session-id": sessionId },
      });

      // Remove session from localStorage and redirect to home page
      localStorage.removeItem("session-id");

      // Redirect to home page after logout
      window.location.href = "/";
    };

    logoutUser();
  }, []);

  return <h1>Logging out...</h1>;
}
