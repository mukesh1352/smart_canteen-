"use client";

import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Item {
  id: string;
  name: string;
  total: number;
  quantitysold: number;
}

export default function AdminPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedTotal, setEditedTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "items"));
        const itemsList: Item[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().Item || "Unnamed",
          total: doc.data().Total || 0,
          quantitysold: doc.data().quantitysold || 0,  // 🔥 Correctly mapped
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
    try {
      const docRef = await addDoc(collection(db, "items"), {
        Item: "New Item",
        Total: 0,
        quantitysold: 0, // 🔥 Ensure it matches Firestore
      });
      setItems([...items, { id: docRef.id, name: "New Item", total: 0, quantitysold: 0 }]);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-cyan-400">Smart Canteen</h1>
        <button onClick={addItem} className="bg-green-500 px-4 py-2 rounded">Add Row</button>
      </div>
      {loading ? (
        <p className="text-center text-cyan-400">Loading...</p>
      ) : (
        <>
          <div className="overflow-x-auto mb-6">
            <table className="table-auto w-full border-collapse border border-cyan-500">
              <thead>
                <tr className="bg-cyan-500 text-black">
                  <th className="border border-cyan-500 px-4 py-2">Item Name</th>
                  <th className="border border-cyan-500 px-4 py-2">Total</th>
                  <th className="border border-cyan-500 px-4 py-2">Quantity Sold</th>
                  <th className="border border-cyan-500 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="text-center">
                    {editingItemId === item.id ? (
                      <>
                        <td><input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="border p-2 rounded bg-gray-800 text-white" /></td>
                        <td><input type="number" value={editedTotal} onChange={(e) => setEditedTotal(Number(e.target.value))} className="border p-2 rounded bg-gray-800 text-white" /></td>
                        <td>{item.quantitysold}</td>
                        <td>
                          <button className="bg-green-500 px-2 py-1 rounded" onClick={() => saveItem(item.id)}>Save</button>
                          <button className="bg-gray-500 px-2 py-1 rounded" onClick={() => setEditingItemId(null)}>Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{item.name}</td>
                        <td>{item.total}</td>
                        <td>{item.quantitysold}</td>
                        <td>
                          <button className="bg-yellow-500 px-2 py-1 rounded" onClick={() => editItem(item)}>Edit</button>
                          <button className="bg-red-500 px-2 py-1 rounded" onClick={() => deleteItem(item.id)}>Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="w-full h-64 bg-gray-900 p-4 rounded-lg">
            <h2 className="text-xl text-cyan-400 mb-4">Quantity Sold Chart</h2>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={items} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#FFFFFF" />
                <YAxis stroke="#FFFFFF" />
                <Tooltip />
                <Bar dataKey="quantitysold" fill="#00FFFF" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
