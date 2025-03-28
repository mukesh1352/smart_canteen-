"use client";
import { useEffect, useState } from "react";
import { database } from "../firebase"; // Import Firebase database
import { ref, onValue } from "firebase/database";

const QueueCounter = () => {
  const [latestQueueCount, setLatestQueueCount] = useState<{ timestamp: string; count: number } | null>(null);

  useEffect(() => {
    const dbRef = ref(database, "/queue_counter");

    // Listen for changes in Firebase Realtime Database
    onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setLatestQueueCount({
          timestamp: new Date().toLocaleTimeString(), // 🔹 Store the last update time
          count: data,
        });
      }
    });

    return () => {}; // Cleanup function
  }, []);

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md flex items-center justify-center">
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
  );
};

export default QueueCounter;
