"use client";

import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc } from "firebase/firestore";

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

  // ✅ Fetch items from Firestore
  useEffect(() => {
    const fetchItems = async () => {
      try {
        console.log("🔹 Fetching items from Firestore...");
        const querySnapshot = await getDocs(collection(db, "items"));

        if (querySnapshot.empty) {
          console.log("⚠️ No data found in Firestore!");
        } else {
          console.log("✅ Data found:", querySnapshot.docs.length);
        }

        const itemsList: Item[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("📌 Document Data:", data);

          return {
            id: doc.id,
            name: data.Item || "Unnamed", // ✅ Fix: Use "Item"
            total: data.Total || 0, // ✅ Fix: Use "Total"
          };
        });

        setItems(itemsList);
      } catch (error) {
        console.error("🔥 Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // ✅ Add a new item
  const addItem = async () => {
    if (!newItemName || newItemTotal <= 0) {
      alert("❌ Please enter valid item details.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "items"), {
        Item: newItemName,
        Total: newItemTotal, 
      });

      setItems([...items, { id: docRef.id, name: newItemName, total: newItemTotal }]);
      setNewItemName("");
      setNewItemTotal(0);
      console.log("✅ Item added successfully!");
    } catch (error) {
      console.error("🔥 Error adding item:", error);
    }
  };

  // ✅ Delete an item
  const deleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, "items", id));
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
      console.log(`🗑️ Item with ID: ${id} deleted.`);
    } catch (error) {
      console.error("🔥 Error deleting item:", error);
    }
  };

  // ✅ Enable edit mode
  const editItem = (item: Item) => {
    setEditingItemId(item.id);
    setEditedName(item.name);
    setEditedTotal(item.total);
  };

  // ✅ Save updated item data
  const saveItem = async (id: string) => {
    try {
      await updateDoc(doc(db, "items", id), {
        Item: editedName, // ✅ Use "Item"
        Total: editedTotal, // ✅ Use "Total"
      });

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, name: editedName, total: editedTotal } : item
        )
      );

      setEditingItemId(null);
      console.log(`✅ Item with ID: ${id} updated successfully!`);
    } catch (error) {
      console.error("🔥 Error updating item:", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Item Management</h1>

      {/* ✅ Show loading state */}
      {loading ? (
        <p className="text-center text-gray-500">⏳ Loading items...</p>
      ) : (
        <>
          {/* ✅ Add New Item */}
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="Item Name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="input input-bordered input-sm w-full max-w-xs"
            />
            <input
              type="number"
              placeholder="Total"
              value={newItemTotal}
              onChange={(e) => setNewItemTotal(Number(e.target.value))}
              className="input input-bordered input-sm w-full max-w-xs"
            />
            <button className="btn btn-primary btn-sm" onClick={addItem}>
              Add Item
            </button>
          </div>

          {/* ✅ Display and Edit Items */}
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-gray-500">
                      🚫 No items found.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {editingItemId === item.id ? (
                          <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="input input-bordered input-sm w-full max-w-xs"
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
                            className="input input-bordered input-sm w-full max-w-xs"
                          />
                        ) : (
                          item.total
                        )}
                      </td>
                      <td className="flex gap-2">
                        {editingItemId === item.id ? (
                          <button className="btn btn-success btn-sm" onClick={() => saveItem(item.id)}>
                            Save
                          </button>
                        ) : (
                          <button className="btn btn-info btn-sm" onClick={() => editItem(item)}>
                            Edit
                          </button>
                        )}
                        <button className="btn btn-error btn-sm" onClick={() => deleteItem(item.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
