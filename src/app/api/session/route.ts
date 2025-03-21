import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

redis.on("error", (err) => console.error("Redis connection error:", err));

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();
    if (!username) return NextResponse.json({ error: "Username required" }, { status: 400 });

    const sessionId = `session_${username}`;
    await redis.set(sessionId, JSON.stringify({ username, loggedIn: true }), "EX", 3600);

    return NextResponse.json({ sessionId });
  } catch {
    return NextResponse.json({ error: "Error creating session" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.headers.get("session-id");
    if (!sessionId) return NextResponse.json({ error: "No session ID provided" }, { status: 400 });

    const session = await redis.get(sessionId);
    if (!session) return NextResponse.json({ logout: true }, { status: 401 });

    return NextResponse.json({ session: JSON.parse(session) });
  } catch {
    return NextResponse.json({ error: "Error retrieving session" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionId = req.headers.get("session-id");
    if (!sessionId) return NextResponse.json({ error: "No session ID provided" }, { status: 400 });

    await redis.del(sessionId);
    return NextResponse.json({ message: "Session deleted" });
  } catch {
    return NextResponse.json({ error: "Error deleting session" }, { status: 500 });
  }
}
