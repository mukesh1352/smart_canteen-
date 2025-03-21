"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";  // Import router

export default function Logout() {
  const router = useRouter();  // Initialize router

  useEffect(() => {
    const logoutUser = async () => {
      const sessionId = localStorage.getItem("session-id");
      if (!sessionId) {
        // If no session found, redirect directly to home page
        router.push("/");  // Redirect to home page
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
      router.push("/");  // Redirect to home page
    };

    logoutUser();
  }, [router]);

  return <h1>Logging out...</h1>;
}
