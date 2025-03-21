"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Session {
  username: string;
  loggedIn: boolean;
}

export default function ProtectedPage() {
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  useEffect(() => {
    const sessionId = localStorage.getItem("session-id");

    if (!sessionId) {
      router.push("/login");
      return;
    }

    fetch("/api/session", { method: "GET", headers: { "session-id": sessionId } })
      .then((res) => res.json())
      .then((data) => {
        if (data.logout) {
          router.push("/login");
        } else {
          setSession(data.session);
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  return session ? <h1>Welcome, {session.username}!</h1> : <h1>Checking session...</h1>;
}
