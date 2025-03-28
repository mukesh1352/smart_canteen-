"use client";
import { useEffect, useState } from "react";
import { database } from "../firebase"; 
import { ref, onValue, off, DataSnapshot } from "firebase/database";

const LOW_LEVEL_THRESHOLD = 10;  // Adjust based on sensor calibration
const HIGH_LEVEL_THRESHOLD = 100; // Adjust based on sensor calibration

const Data = () => {
  const [latestWaterLevel, setLatestWaterLevel] = useState<{ timestamp: string; level: number } | null>(null);
  const [lastAlert, setLastAlert] = useState<"low" | "high" | null>(null);

  useEffect(() => {
    const dbRef = ref(database, "/water_levels");

    const handleValueChange = (snapshot: DataSnapshot) => {  // ✅ Properly typed
      if (snapshot.exists()) {
        const data = snapshot.val() as Record<string, number>;
        const formattedData = Object.entries(data).map(([timestamp, level]) => ({
          timestamp,
          level,
        }));

        const latestEntry = formattedData.sort((a, b) => Number(b.timestamp) - Number(a.timestamp))[0];

        setLatestWaterLevel(latestEntry);

        // Check water level and trigger alert only once per state
        if (latestEntry.level <= LOW_LEVEL_THRESHOLD && lastAlert !== "low") {
          alert("⚠️ Water level is CRITICAL! Please refill the tank.");
          setLastAlert("low");
        } else if (latestEntry.level >= HIGH_LEVEL_THRESHOLD && lastAlert !== "high") {
          alert("✅ Water level is HIGH.");
          setLastAlert("high");
        } else if (latestEntry.level > LOW_LEVEL_THRESHOLD && latestEntry.level < HIGH_LEVEL_THRESHOLD) {
          setLastAlert(null); // Reset if within normal range
        }
      }
    };

    onValue(dbRef, handleValueChange); // ✅ Listen to Firebase changes

    return () => off(dbRef, "value", handleValueChange); // ✅ Cleanup listener on unmount
  }, [lastAlert]); // Only depend on `lastAlert`

  // Set background color dynamically
  const getBackgroundColor = () => {
    if (!latestWaterLevel) return "bg-gray-100";
    if (latestWaterLevel.level <= LOW_LEVEL_THRESHOLD) return "bg-red-500 text-white";
    if (latestWaterLevel.level >= HIGH_LEVEL_THRESHOLD) return "bg-green-500 text-white";
    return "bg-yellow-300";
  };

  return (
    <div className={`p-6 rounded-lg shadow-md flex items-center justify-center ${getBackgroundColor()}`}>
      <h2 className="text-2xl font-bold mr-4">💧 Water Level:</h2>

      {latestWaterLevel ? (
        <div className="p-4 bg-white shadow-md rounded-md text-center">
          <span className="block text-gray-600 text-sm">
            Last updated: {new Date(parseInt(latestWaterLevel.timestamp)).toLocaleTimeString()}
          </span>
          <span className="text-lg font-bold">{latestWaterLevel.level} 🚰</span>
        </div>
      ) : (
        <p className="text-gray-500 text-lg">Fetching latest data...</p>
      )}
    </div>
  );
};

export default Data;
