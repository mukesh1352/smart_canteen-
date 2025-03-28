"use client";

import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";

export default function SelectionPage() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [order, setOrder] = useState<{ [key: string]: number }>({});
  const [user] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    const fetchMenuItems = async () => {
      const querySnapshot = await getDocs(collection(db, "items"));
      const itemsArray = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMenuItems(itemsArray);
    };
    fetchMenuItems();
  }, []);

  const handleOrderChange = (itemId: string, quantity: number) => {
    setOrder(prev => ({ ...prev, [itemId]: quantity }));
  };

  const handleGenerateToken = async () => {
    if (!user) {
      alert("You need to be logged in to generate a token.");
      router.push("/login"); // Redirect to login page
      return;
    }

    const tokenId = Math.floor(Math.random() * 1000000);
    const userRef = collection(db, "user_detail");
    const userQuerySnapshot = await getDocs(userRef);
    let username = "Unknown User";

    userQuerySnapshot.forEach(doc => {
      if (doc.data().email === user.email) {
        username = doc.data().name;
      }
    });

    const tokenData = {
      tokenId,
      userId: user.uid,
      username,
      items: Object.keys(order).map(itemId => ({
        itemId,
        quantity: order[itemId],
      })),
      createdAt: new Date(),
    };

    await addDoc(collection(db, "tokens"), tokenData);

    for (const itemId in order) {
      const itemRef = doc(db, "items", itemId);
      const itemSnapshot = await getDocs(collection(db, "items"));
      itemSnapshot.forEach(async docSnap => {
        if (docSnap.id === itemId) {
          const currentData = docSnap.data();
          const newQuantitySold = (currentData.quantitysold || 0) + order[itemId];
          await updateDoc(itemRef, { quantitysold: newQuantitySold });
        }
      });
    }

    alert(`Token Generated: ${tokenId}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 p-6">
      <h1 className="text-3xl font-bold mb-6">Select Your Items</h1>

      <div className="w-full max-w-md space-y-4">
        {menuItems.map(item => (
          <div key={item.id} className="card bg-white shadow-md p-4 rounded-lg">
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <p className="text-gray-600">Available: {item.total - (item.quantitysold || 0)}</p>

            <input
              type="number"
              min="0"
              className="input input-bordered w-full mt-2"
              placeholder="Enter quantity"
              onChange={e => handleOrderChange(item.id, parseInt(e.target.value))}
            />
          </div>
        ))}
      </div>

      {user ? (
        <button
          onClick={handleGenerateToken}
          className="btn btn-primary mt-6"
        >
          Generate Token
        </button>
      ) : (
        <p className="mt-4 text-red-500">You must be logged in to generate a token.</p>
      )}
    </div>
  );
}
