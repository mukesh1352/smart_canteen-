"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sun, Moon } from "lucide-react";

export default function Header() {
  const [session, setSession] = useState<{ username: string } | null>(null);
  const [theme, setTheme] = useState<string>("dark");
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

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
          } else {
            localStorage.removeItem("session-id");
            setSession(null);
          }
        })
        .catch((error) => {
          console.error("Error fetching session:", error);
          localStorage.removeItem("session-id");
        });
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleLogout = async () => {
    const sessionId = localStorage.getItem("session-id");
    if (sessionId) {
      await fetch("/api/session", {
        method: "DELETE",
        headers: { "session-id": sessionId },
      });
    }
    localStorage.removeItem("session-id");
    setSession(null);
    router.push("/");
  };

  return (
    <header className="backdrop-blur-md bg-gray-900/30 dark:bg-gray-800/30 shadow-md fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-200">Smart Canteen</h1>

        <nav className="flex gap-4 items-center">
          <button onClick={toggleTheme} className="btn btn-ghost btn-sm">
            {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-900" />}
          </button>

          {session ? (
            <button onClick={handleLogout} className="btn btn-error btn-sm text-white">Logout</button>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link href="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
