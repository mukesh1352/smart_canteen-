"use client";

import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Item {
  id: string;
  name: string;
  total: number;
}

export default function AdminPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedTotal, setEditedTotal] = useState<number>(0);
  const [newItemName, setNewItemName] = useState("");
  const [newItemTotal, setNewItemTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "items"));
        const itemsList: Item[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().Item || "Unnamed",
          total: doc.data().Total || 0,
        }));
        setItems(itemsList);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const addItem = async () => {
    if (!newItemName || newItemTotal <= 0) return;
    try {
      const docRef = await addDoc(collection(db, "items"), {
        Item: newItemName,
        Total: newItemTotal,
      });
      setItems([...items, { id: docRef.id, name: newItemName, total: newItemTotal }]);
      setNewItemName("");
      setNewItemTotal(0);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, "items", id));
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const editItem = (item: Item) => {
    setEditingItemId(item.id);
    setEditedName(item.name);
    setEditedTotal(item.total);
  };

  const saveItem = async (id: string) => {
    try {
      await updateDoc(doc(db, "items", id), {
        Item: editedName,
        Total: editedTotal,
      });
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, name: editedName, total: editedTotal } : item
        )
      );
      setEditingItemId(null);
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-black text-white">
      <h1 className="text-3xl font-bold mb-6 text-center text-cyan-400">J.A.R.V.I.S. Admin Dashboard</h1>

      {loading ? (
        <p className="text-center text-cyan-400">Loading...</p>
      ) : (
        <>
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="Item Name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="border p-2 rounded bg-gray-800 text-white"
            />
            <input
              type="number"
              placeholder="Total"
              value={newItemTotal}
              onChange={(e) => setNewItemTotal(Number(e.target.value))}
              className="border p-2 rounded bg-gray-800 text-white"
            />
            <button className="bg-cyan-500 text-white px-4 py-2 rounded" onClick={addItem}>
              Add Item
            </button>
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="table-auto w-full border-collapse border border-cyan-500">
              <thead>
                <tr className="bg-cyan-500 text-black">
                  <th className="border border-cyan-500 px-4 py-2">Item Name</th>
                  <th className="border border-cyan-500 px-4 py-2">Total</th>
                  <th className="border border-cyan-500 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="text-center">
                    {editingItemId === item.id ? (
                      <>
                        <td className="border border-cyan-500 px-4 py-2">
                          <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="border p-2 rounded bg-gray-800 text-white"
                          />
                        </td>
                        <td className="border border-cyan-500 px-4 py-2">
                          <input
                            type="number"
                            value={editedTotal}
                            onChange={(e) => setEditedTotal(Number(e.target.value))}
                            className="border p-2 rounded bg-gray-800 text-white"
                          />
                        </td>
                        <td className="border border-cyan-500 px-4 py-2">
                          <button className="bg-green-500 text-white px-2 py-1 rounded mr-2" onClick={() => saveItem(item.id)}>
                            Save
                          </button>
                          <button className="bg-gray-500 text-white px-2 py-1 rounded" onClick={() => setEditingItemId(null)}>
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="border border-cyan-500 px-4 py-2">{item.name}</td>
                        <td className="border border-cyan-500 px-4 py-2">{item.total}</td>
                        <td className="border border-cyan-500 px-4 py-2">
                          <button className="bg-yellow-500 text-black px-2 py-1 rounded mr-2" onClick={() => editItem(item)}>
                            Edit
                          </button>
                          <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => deleteItem(item.id)}>
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center mt-6">
            <ResponsiveContainer width="90%" height={300}>
              <BarChart data={items} barCategoryGap={15}>
                <CartesianGrid strokeDasharray="3 3" stroke="cyan" />
                <XAxis dataKey="name" stroke="cyan" />
                <YAxis stroke="cyan" />
                <Tooltip cursor={{ fill: "rgba(0,255,255,0.2)" }} contentStyle={{ backgroundColor: "black", borderColor: "cyan" }} />
                <Bar dataKey="total" fill="url(#neonGradient)" animationDuration={1000} />
                <defs>
                  <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00ffff" />
                    <stop offset="100%" stopColor="#005f5f" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
