"use client";

import { useEffect, useState } from "react";
import { db } from "../firebase"; // Ensure correct Firebase path
import { collection, getDocs, updateDoc, doc, addDoc, getDoc } from "firebase/firestore";

interface MenuItem {
  id: string;
  Item: string;
  Total: number;
  quantitysold?: number;
}

interface Order {
  [key: string]: {
    quantity: number;
    price: number;
    name: string;
  };
}

export default function Page() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [order, setOrder] = useState<Order>({});
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch items from Firebase
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "items"));
        const menuItems: MenuItem[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<MenuItem, "id">),
        }));
        setItems(menuItems);
      } catch (error) {
        console.error("Error fetching menu:", error);
      }
    };
    fetchItems();
  }, []);

  // Handle quantity change
  const handleQuantityChange = (itemId: string, quantity: number, price: number, name: string) => {
    if (quantity < 0) return;
    setOrder((prev) => ({
      ...prev,
      [itemId]: { quantity, price, name },
    }));
  };

  // Calculate total price
  useEffect(() => {
    let total = 0;
    Object.keys(order).forEach((key) => {
      total += order[key].quantity * order[key].price;
    });
    setTotalPrice(total);
  }, [order]);

  // Handle Token Generation and Database Update
  const handleTokenGeneration = async () => {
    setLoading(true);
    try {
      if (Object.keys(order).length === 0) {
        alert("Please select at least one item.");
        setLoading(false);
        return;
      }

      // Generate unique token ID (6-digit integer)
      const tokenId = Math.floor(100000 + Math.random() * 900000);

      // Create token object with ordered items
      const tokenData = {
        tokenId,
        items: Object.keys(order).map((itemId) => ({
          itemId,
          name: order[itemId].name,
          quantity: order[itemId].quantity,
          totalPrice: order[itemId].quantity * order[itemId].price,
        })),
        grandTotal: totalPrice,
        timestamp: new Date(),
      };

      // Save token to "tokens" collection (Admin Side)
      await addDoc(collection(db, "tokens"), tokenData);

      // Update the `quantitysold` field in "items" collection
      for (const itemId of Object.keys(order)) {
        const itemRef = doc(db, "items", itemId);

        // Fetch the current `quantitysold` value
        const itemSnap = await getDoc(itemRef);
        if (itemSnap.exists()) {
          const currentData = itemSnap.data() as MenuItem;
          const currentQuantitySold = currentData.quantitysold || 0;

          // Increment `quantitysold` without overwriting
          const newQuantitySold = currentQuantitySold + order[itemId].quantity;

          // Update Firestore
          await updateDoc(itemRef, { quantitysold: newQuantitySold });
        }
      }

      alert(`Token Generated: ${tokenId}\nYour order has been placed.`);
      setOrder({}); // Reset order after purchase
    } catch (error) {
      console.error("Error generating token:", error);
      alert("Something went wrong! Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-100 to-purple-200">
      <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">
        🍽️ Menu Selection
      </h1>
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg p-6">
        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item) => (
              <div key={item.id} className="card bg-base-100 shadow-lg hover:scale-105">
                <div className="card-body">
                  <h2 className="card-title text-xl">{item.Item}</h2>
                  <p className="text-gray-500">Available: {item.Total}</p>
                  <div className="flex items-center space-x-2 mt-3">
                    <input
                      type="number"
                      min="0"
                      max={item.Total}
                      value={order[item.id]?.quantity || 0}
                      onChange={(e) =>
                        handleQuantityChange(item.id, parseInt(e.target.value, 10), item.Total, item.Item)
                      }
                      className="input input-bordered w-20 text-center"
                    />
                    <span className="badge badge-lg badge-primary text-lg">
                      ₹{(order[item.id]?.quantity || 0) * item.Total}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">Loading menu...</p>
        )}
        <div className="mt-8 text-right text-2xl font-bold text-gray-700">Total: ₹{totalPrice}</div>
        <div className="flex justify-center mt-6">
          <button
            className={`btn btn-success text-lg px-6 py-2 rounded-lg shadow-md transition-transform ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
            }`}
            onClick={handleTokenGeneration}
            disabled={loading}
          >
            {loading ? "Processing..." : "🎟️ Get Token"}
          </button>
        </div>
      </div>
    </div>
  );
}
