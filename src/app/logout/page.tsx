"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    const sessionId = localStorage.getItem("session-id");

    if (!sessionId) {
      router.push("/");
      return;
    }

    fetch("/api/session", { method: "DELETE", headers: { "session-id": sessionId } })
      .finally(() => {
        localStorage.removeItem("session-id");
        router.push("/");
      });
  }, [router]);

  return <h1>Logging out...</h1>;
}
