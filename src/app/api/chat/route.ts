import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // Extract query from request
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ response: "Please enter a query!" }, { status: 400 });
    }

    // Call Flask API
    const flaskResponse = await fetch(`http://127.0.0.1:5000/chat?query=${encodeURIComponent(query)}`);
    const data = await flaskResponse.json();

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ response: "Error connecting to the chatbot backend." }, { status: 500 });
  }
}
