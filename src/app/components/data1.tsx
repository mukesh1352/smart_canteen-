"use client";
import { useEffect, useState } from "react";
import { database } from "../firebase"; 
import { ref, onValue, off } from "firebase/database";

const Data = () => {
  const [latestWaterLevel, setLatestWaterLevel] = useState<{ timestamp: string; level: number } | null>(null);

  useEffect(() => {
    const dbRef = ref(database, "/water_levels");

    onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const formattedData = Object.entries(data).map(([timestamp, level]) => ({
          timestamp,
          level: level as number,
        }));

        const latestEntry = formattedData.sort((a, b) => Number(b.timestamp) - Number(a.timestamp))[0];

        setLatestWaterLevel(latestEntry);
      }
    });

    return () => off(dbRef, "value"); // ✅ Proper cleanup
  }, []);

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md flex items-center justify-center">
      <h2 className="text-2xl font-bold mr-4">💧 Water Level:</h2>

      {latestWaterLevel ? (
        <div className="p-4 bg-white shadow-md rounded-md text-center">
          <span className="block text-gray-600 text-sm">
            Last updated: {new Date(parseInt(latestWaterLevel.timestamp)).toLocaleTimeString()}
          </span>
          <span className="text-blue-600 text-lg font-bold">{latestWaterLevel.level} 🚰</span>
        </div>
      ) : (
        <p className="text-gray-500 text-lg">Fetching latest data...</p>
      )}
    </div>
  );
};

export default Data;
