"use client";
import { useState, useEffect } from "react";
import { db } from "../firebase";  // Assuming this is your Firestore database instance
import { collection, getDocs } from "firebase/firestore";

// Define a type for items
interface Item {
  id: string;
  Item: string;
  Total: number;
}

export default function ItemList() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        // Change the collection name to 'items' here
        const querySnapshot = await getDocs(collection(db, "items"));
        const itemList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          Item: doc.data().Item || "",
          Total: doc.data().Total || 0
        }));

        // Sort items by extracting numeric part from "row-XX"
        itemList.sort((a, b) => {
          const numA = parseInt(a.id.replace("row-", ""), 10);
          const numB = parseInt(b.id.replace("row-", ""), 10);
          return numA - numB;
        });

        setItems(itemList);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return (
    <div className="p-6 flex flex-col items-center">
      {loading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {items.map((item) => (
            <div key={item.id} className="card w-full bg-base-100 shadow-xl border border-gray-200">
              <div className="card-body items-center text-center">
                <h3 className="card-title text-xl font-semibold">{item.Item || "Unknown Item"}</h3>
                <p className="text-lg text-gray-600">Price: ₹{item.Total || "N/A"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
