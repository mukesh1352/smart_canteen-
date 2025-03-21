import { NextRequest, NextResponse } from "next/server";

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL!;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN!;

// Helper function to interact with Upstash Redis
async function redisFetch(command: string, args: (string | number)[]): Promise<{ result: string | null }> {
  const res = await fetch(`${UPSTASH_REDIS_REST_URL}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([command, ...args]),
  });

  return res.json();
}

// Create a session
export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();
    if (!username) return NextResponse.json({ error: "Username required" }, { status: 400 });

    const sessionId = `session_${username}`;
    const sessionData = JSON.stringify({ username, loggedIn: true });

    await redisFetch("SET", [sessionId, sessionData, "EX", 3600]);

    return NextResponse.json({ sessionId });
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json({ error: "Error creating session" }, { status: 500 });
  }
}

// Retrieve session
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.headers.get("session-id");
    if (!sessionId) return NextResponse.json({ error: "No session ID provided" }, { status: 400 });

    const session = await redisFetch("GET", [sessionId]);
    if (!session.result) {
      return NextResponse.json({ logout: true, error: "Session expired or invalid" }, { status: 401 });
    }

    return NextResponse.json({ session: JSON.parse(session.result) });
  } catch (error) {
    console.error("Session retrieval error:", error);
    return NextResponse.json({ error: "Error retrieving session" }, { status: 500 });
  }
}

// Delete session
export async function DELETE(req: NextRequest) {
  try {
    const sessionId = req.headers.get("session-id");
    if (!sessionId) {
      return NextResponse.json({ error: "No session ID provided" }, { status: 400 });
    }

    await redisFetch("DEL", [sessionId]);

    return NextResponse.json({ message: "Session deleted" });
  } catch (error) {
    console.error("Session deletion error:", error);
    return NextResponse.json({ error: "Error deleting session" }, { status: 500 });
  }
}
