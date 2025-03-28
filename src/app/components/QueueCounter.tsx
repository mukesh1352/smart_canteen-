"use client";
import { useEffect, useState } from "react";
import { database } from "../firebase"; // Import Firebase database
import { ref, onValue } from "firebase/database";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";

const QueueCounter = () => {
  const [latestQueueCount, setLatestQueueCount] = useState<{ timestamp: string; count: number } | null>(null);
  const [queueHistory, setQueueHistory] = useState<{ timestamp: string; count: number }[]>([]);

  useEffect(() => {
    const dbRef = ref(database, "/queue_counter");

    // Listen for changes in Firebase Realtime Database
    onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const newEntry = {
          timestamp: new Date().toLocaleTimeString(),
          count: data,
        };

        setLatestQueueCount(newEntry);
        setQueueHistory((prev) => [...prev.slice(-19), newEntry]); // Keep last 20 records for smoother graph
      }
    });

    return () => {}; // Cleanup function
  }, []);

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <div className="flex items-center justify-center mb-6">
        <h2 className="text-2xl font-bold mr-4">🚶‍♂️ Queue Count:</h2>
        {latestQueueCount ? (
          <div className="p-4 bg-white shadow-md rounded-md text-center">
            <span className="block text-gray-600 text-sm">Last updated: {latestQueueCount.timestamp}</span>
            <span className="text-blue-600 text-lg font-bold">{latestQueueCount.count} 🏪</span>
          </div>
        ) : (
          <p className="text-gray-500 text-lg">Fetching latest queue data...</p>
        )}
      </div>

      {/* Live Graph */}
      <div className="bg-white p-4 shadow-md rounded-md overflow-x-auto">
        <h3 className="text-lg font-semibold mb-2">📊 Queue Trend</h3>
        <div className="w-[1200px] max-w-full">
          <ResponsiveContainer width="100%" height={300} aspect={2.5}>
            <LineChart data={queueHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default QueueCounter;
