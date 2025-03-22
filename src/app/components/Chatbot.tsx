"use client";
import { useState } from "react";

export default function Chatbot() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isOpen, setIsOpen] = useState(false); // To toggle the chat window

  const sendQuery = async () => {
    if (!query) return;
    setResponse("Thinking...");
    try {
      const res = await fetch(`/api/chat?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResponse(data.response);
    } catch {
      setResponse("Error fetching response.");
    }
  };

  return (
    <div>
      {/* Chat Icon to open the chat window */}
      {!isOpen && (
        <button
          className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-400 transition-all"
          onClick={() => setIsOpen(true)}
        >
          <span className="text-3xl">💬</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 w-96 p-4 bg-gray-800 text-white rounded-lg shadow-lg border border-gray-700 transition-all">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Smart Canteen Chatbot</h2>
            <button
              className="text-gray-400 hover:text-gray-200"
              onClick={() => setIsOpen(false)} // Close the chat window
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          {/* Chat Input and Send Button */}
          <div className="mb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask something..."
              className="input input-bordered w-full p-2 bg-gray-700 text-white"
            />
          </div>
          <button
            onClick={sendQuery}
            className="btn btn-primary w-full mb-4"
          >
            Send
          </button>

          {/* Chatbot Response */}
          {response && (
            <div className="p-3 bg-gray-600 rounded-lg">
              <p>{response}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
