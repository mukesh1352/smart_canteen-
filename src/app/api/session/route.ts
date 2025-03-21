import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";

// Initialize Redis Client
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// Ensure Redis connection is alive before processing requests
redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

// Handle POST request (Create session after login)
export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();
    if (!username) return NextResponse.json({ error: "Username required" }, { status: 400 });

    const sessionId = `session_${username}`;
    const sessionData = { username, loggedIn: true };

    // Store session in Redis with 1-hour expiry
    await redis.set(sessionId, JSON.stringify(sessionData), "EX", 3600);

    return NextResponse.json({ message: "Session created", sessionId });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json({ error: "Error creating session" }, { status: 500 });
  }
}

// Handle GET request (Check session)
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.headers.get("session-id");
    if (!sessionId) return NextResponse.json({ error: "No session ID provided" }, { status: 400 });

    const session = await redis.get(sessionId);
    
    // If session is not found (e.g., Redis restart), force logout
    if (!session) {
      return NextResponse.json({ error: "Session expired or not found", logout: true }, { status: 401 });
    }

    return NextResponse.json({ session: JSON.parse(session) });
  } catch (error) {
    console.error("Error retrieving session:", error);
    return NextResponse.json({ error: "Error retrieving session" }, { status: 500 });
  }
}

// Handle DELETE request (Logout)
export async function DELETE(req: NextRequest) {
  try {
    const sessionId = req.headers.get("session-id");
    if (!sessionId) return NextResponse.json({ error: "No session ID provided" }, { status: 400 });

    await redis.del(sessionId);

    return NextResponse.json({ message: "Session deleted" });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json({ error: "Error deleting session" }, { status: 500 });
  }
}
