"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sun, Moon } from "lucide-react";

// Define a type for the session object
interface Session {
  userId: string;
  username: string;
  // Add other session-related properties if necessary
}

export default function Header() {
  const [session, setSession] = useState<Session | null>(null); // Improved session type
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
          }
        })
        .catch((error) => console.error("Error fetching session:", error));
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem("session-id");
    router.push("/logout");
  };

  return (
    <header className="backdrop-blur-md bg-gray-900/30 dark:bg-gray-800/30 shadow-md fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-200 transition-colors duration-300">
          Smart Canteen
        </h1>

        <nav className="flex gap-4 items-center">
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-sm transition-all duration-300"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-400 hover:scale-110 transition-transform" />
            ) : (
              <Moon className="w-5 h-5 text-gray-900 hover:scale-110 transition-transform" />
            )}
          </button>

          {session ? (
            <button
              onClick={handleLogout}
              className="btn btn-error btn-sm text-white hover:bg-red-600 transition-all duration-300"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="btn btn-outline btn-sm border-gray-900 text-gray-900 dark:border-gray-300 dark:text-gray-300 hover:border-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300"
              >
                Login
              </Link>
              <Link href="/signup" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
