"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const sessionId = localStorage.getItem("session-id");

    if (sessionId) {
      fetch("/api/session", {
        method: "GET",
        headers: { "session-id": sessionId },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.session) {
            setSession(data.session);
          }
        })
        .catch((error) => console.error("Error fetching session:", error));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("session-id");
    router.push("/logout");
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <h1 style={styles.title}>Smart Canteen</h1>
        <nav style={styles.nav}>
          {session ? (
            <button onClick={handleLogout} style={styles.button}>
              Logout
            </button>
          ) : (
            <>
              <Link href="/login" style={styles.button}>
                Login
              </Link>
              <Link href="/signup" style={{ ...styles.button, backgroundColor: "#007bff" }}>
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

import { CSSProperties } from "react";

const styles: { [key: string]: CSSProperties } = {
  header: {
    backgroundColor: "#333",
    padding: "10px 20px",
    color: "white",
    textAlign: "center",
  },
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: "2rem",
    margin: 0,
  },
  nav: {
    display: "flex",
    gap: "15px",
  },
  button: {
    padding: "10px 20px",
    borderRadius: "5px",
    backgroundColor: "#28a745",
    color: "white",
    textDecoration: "none",
    textAlign: "center",
    transition: "background-color 0.3s",
  },
};
