"use client";
import { useEffect, useState } from "react";
import { database } from "../firebase"; 
import { ref, onValue, off, DataSnapshot } from "firebase/database";

const LOW_LEVEL_THRESHOLD = 10;
const HIGH_LEVEL_THRESHOLD = 100;

const Data = () => {
  const [latestWaterLevel, setLatestWaterLevel] = useState<{ timestamp: string; level: number } | null>(null);
  const [lastAlert, setLastAlert] = useState<"low" | "high" | null>(null);

  useEffect(() => {
    const dbRef = ref(database, "/water_levels");

    const handleValueChange = (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as Record<string, number>;
        const formattedData = Object.entries(data).map(([timestamp, level]) => ({
          timestamp,
          level,
        }));

        const latestEntry = formattedData.sort((a, b) => Number(b.timestamp) - Number(a.timestamp))[0];

        setLatestWaterLevel(latestEntry);

        // Trigger alert only when crossing thresholds
        if (latestEntry.level <= LOW_LEVEL_THRESHOLD && lastAlert !== "low") {
          alert("⚠️ Water level is CRITICAL! Please refill the tank.");
          setLastAlert("low");
        } else if (latestEntry.level >= HIGH_LEVEL_THRESHOLD && lastAlert !== "high") {
          alert("✅ Water level is HIGH.");
          setLastAlert("high");
        } else if (latestEntry.level > LOW_LEVEL_THRESHOLD && latestEntry.level < HIGH_LEVEL_THRESHOLD) {
          setLastAlert(null);
        }
      }
    };

    onValue(dbRef, handleValueChange);

    return () => off(dbRef, "value", handleValueChange);
  }, [lastAlert]);

  const getBackgroundColor = () => {
    if (!latestWaterLevel) return "bg-gray-100";
    if (latestWaterLevel.level <= LOW_LEVEL_THRESHOLD) return "bg-red-500 text-white";
    if (latestWaterLevel.level >= HIGH_LEVEL_THRESHOLD) return "bg-green-500 text-white";
    return "bg-yellow-300";
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full">

      <div className={`w-full max-w-md p-6 rounded-lg shadow-lg transform transition-all duration-300 ${getBackgroundColor()}`}>
        {latestWaterLevel ? (
          <div className="text-center">
            <p className="text-sm text-gray-200 mb-2">Last updated: {new Date(parseInt(latestWaterLevel.timestamp)).toLocaleTimeString()}</p>
            <p className="text-5xl font-bold">{latestWaterLevel.level} 🚰</p>
          </div>
        ) : (
          <p className="text-lg text-gray-700 animate-pulse">Fetching latest data...</p>
        )}
      </div>
    </div>
  );
};

export default Data;
