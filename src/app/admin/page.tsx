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

interface Token {
  id: string;
  tokenId: number;
  grandTotal: number;
}

export default function AdminPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedTotal, setEditedTotal] = useState<number>(0);
  const [newItemName, setNewItemName] = useState("");
  const [newItemTotal, setNewItemTotal] = useState<number>(0);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "items"));
        const itemsList: Item[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().Item || "Unnamed",
          total: doc.data().Total || 0,
          quantitysold: doc.data().quantitysold || 0,
        }));
        setItems(itemsList);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    const fetchTokens = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "tokens"));
        const tokensList: Token[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          tokenId: doc.data().tokenId || 0,
          grandTotal: doc.data().grandTotal || 0,
        }));
        setTokens(tokensList);
      } catch (error) {
        console.error("Error fetching tokens:", error);
      }
    };

    fetchItems();
    fetchTokens();
  }, []);

  const addItem = async () => {
    if (!newItemName || newItemTotal <= 0) {
      alert("Please enter valid item details");
      return;
    }
    try {
      const docRef = await addDoc(collection(db, "items"), {
        Item: newItemName,
        Total: newItemTotal,
        quantitysold: 0,
      });
      setItems([...items, { id: docRef.id, name: newItemName, total: newItemTotal, quantitysold: 0 }]);
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

  const deleteToken = async (id: string) => {
    try {
      await deleteDoc(doc(db, "tokens", id));
      setTokens((prevTokens) => prevTokens.filter((token) => token.id !== id));
    } catch (error) {
      console.error("Error deleting token:", error);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-black text-white">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">Smart Canteen</h1>

      {/* CRUD Operations */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Item Name"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="border p-2 rounded bg-gray-800 text-white mr-2"
        />
        <input
          type="number"
          placeholder="Total"
          value={newItemTotal}
          onChange={(e) => setNewItemTotal(Number(e.target.value))}
          className="border p-2 rounded bg-gray-800 text-white mr-2"
        />
        <button className="bg-blue-500 px-4 py-2 rounded" onClick={addItem}>Add Item</button>
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="table-auto w-full border-collapse border border-cyan-500">
          <thead>
            <tr className="bg-cyan-500 text-black">
              <th className="border border-cyan-500 px-4 py-2">Item</th>
              <th className="border border-cyan-500 px-4 py-2">Total</th>
              <th className="border border-cyan-500 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="text-center">
                <td>
                  {editingItemId === item.id ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="border p-1 bg-gray-800 text-white"
                    />
                  ) : (
                    item.name
                  )}
                </td>
                <td>
                  {editingItemId === item.id ? (
                    <input
                      type="number"
                      value={editedTotal}
                      onChange={(e) => setEditedTotal(Number(e.target.value))}
                      className="border p-1 bg-gray-800 text-white"
                    />
                  ) : (
                    item.total
                  )}
                </td>
                <td>
                  {editingItemId === item.id ? (
                    <button className="bg-green-500 px-2 py-1 rounded mr-2" onClick={() => saveItem(item.id)}>Save</button>
                  ) : (
                    <button className="bg-yellow-500 px-2 py-1 rounded mr-2" onClick={() => editItem(item)}>Edit</button>
                  )}
                  <button className="bg-red-500 px-2 py-1 rounded" onClick={() => deleteItem(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Token View */}
      <div className="overflow-x-auto mb-6">
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Tokens</h2>
        <table className="table-auto w-full border-collapse border border-cyan-500">
          <thead>
            <tr className="bg-cyan-500 text-black">
              <th className="border border-cyan-500 px-4 py-2">Token ID</th>
              <th className="border border-cyan-500 px-4 py-2">Grand Total</th>
            </tr>
          </thead>
          <tbody>
  {tokens.map((token) => (
    <tr key={token.id} className="text-center">
      <td>{token.tokenId}</td>
      <td>{token.grandTotal}</td>
      <td>
        <button className="bg-red-500 px-2 py-1 rounded" onClick={() => deleteToken(token.id)}>
          Delete
        </button>
      </td>
    </tr>
  ))}
</tbody>
        </table>
      </div>

      {/* Graph */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={items} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="quantitysold" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
