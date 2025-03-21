"use client";
import { useEffect } from "react";

export default function Logout() {
  useEffect(() => {
    const logoutUser = async () => {
      const sessionId = localStorage.getItem("session-id");
      if (!sessionId) {
        window.location.href = "/login";
        return;
      }

      await fetch("/api/session", {
        method: "DELETE",
        headers: { "session-id": sessionId },
      });

      localStorage.removeItem("session-id");
      window.location.href = "/"; // Redirect to home page
    };

    logoutUser();
  }, []);

  return <h1>Logging out...</h1>;
}
