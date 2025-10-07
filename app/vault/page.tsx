"use client";

import { useEffect, useState } from "react";
import { encryptData, decryptData } from "@/lib/crypto";
import PasswordGenerator from "../components/PasswordGenerator";

interface VaultItem {
  _id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  iv: string; // Base64 encoded string now
}

export default function VaultPage() {
  const [token, setToken] = useState("");
  const [masterPassword, setMasterPassword] = useState(
    localStorage.getItem("masterPassword") || ""
  );
  const [items, setItems] = useState<VaultItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) {
      setToken(t);
      fetchItems(t);
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchItems(t: string) {
    try {
      const res = await fetch("/api/vault", {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) throw new Error("Failed to fetch items");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function addItem() {
    if (!masterPassword) {
      alert("⚠️ Please set or enter your master password first!");
      return;
    }

    const salt = "vault_salt";
    const plainData = {
      title: "Example Site",
      username: "user@example.com",
      password: "Pass123!",
      url: "https://example.com",
      notes: "Sample entry",
    };

    try {
      const encrypted = await encryptData(
        JSON.stringify(plainData),
        masterPassword,
        salt
      );

      const res = await fetch("/api/vault", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: plainData.title,
          username: plainData.username,
          password: encrypted.cipher,
          url: plainData.url,
          notes: plainData.notes,
          iv: encrypted.iv, // ✅ Store IV as Base64, not JSON
        }),
      });

      if (res.ok) fetchItems(token);
      else alert("❌ Failed to add item");
    } catch (err) {
      console.error("Encryption error:", err);
      alert("❌ Encryption failed!");
    }
  }

  async function deleteItem(id: string) {
    if (!confirm("Are you sure you want to delete this password?")) return;
    try {
      const res = await fetch(`/api/vault/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchItems(token);
      else alert("❌ Failed to delete item");
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  if (loading)
    return <p className="text-center mt-10">Loading your vault...</p>;

  if (!masterPassword) {
    if (typeof window !== "undefined") {
      window.location.href = "/master-password";
    }
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">
        🔐 Your Password Vault
      </h1>

      {/* Master Password Input */}
      <div className="mb-3">
        <input
          type="password"
          placeholder="Enter master password"
          className="border p-2 rounded w-full"
          value={masterPassword}
          onChange={(e) => {
            const val = e.target.value;
            setMasterPassword(val);
            localStorage.setItem("masterPassword", val);
          }}
        />
        {masterPassword ? (
          <p className="text-green-600 text-sm mt-1">
            ✅ Master password active
          </p>
        ) : (
          <p className="text-red-600 text-sm mt-1">
            ⚠️ Please enter your master password to decrypt items
          </p>
        )}
      </div>

      {/* Search + Add */}
      <div className="flex gap-2 mb-4 mt-4">
        <input
          type="text"
          placeholder="Search by title..."
          className="border p-2 rounded w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={addItem}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ➕ Add
        </button>
      </div>

      {/* Password Generator */}
      <div className="mb-6">
        <PasswordGenerator masterPassword={masterPassword} token={token} />
      </div>

      {/* Vault Items */}
      {items.length > 0 ? (
        items
          .filter((i) => i.title.toLowerCase().includes(search.toLowerCase()))
          .map((item) => (
            <VaultCard
              key={item._id}
              item={item}
              masterPassword={masterPassword}
              onDelete={() => deleteItem(item._id)}
            />
          ))
      ) : (
        <p className="text-gray-500 text-center mt-10">
          No saved passwords yet.
        </p>
      )}
    </div>
  );
}

function VaultCard({
  item,
  masterPassword,
  onDelete,
}: {
  item: VaultItem;
  masterPassword: string;
  onDelete: () => void;
}) {
  const [decrypted, setDecrypted] = useState<any>(null);

  async function handleDecrypt() {
    if (!masterPassword) {
      alert("⚠️ Enter your master password first!");
      return;
    }
    try {
      const salt = "vault_salt";
      // ✅ Directly use base64 IV string
      const data = await decryptData(
        item.password,
        item.iv,
        masterPassword,
        salt
      );

      if (data) {
        setDecrypted(JSON.parse(data));
      } else {
        alert("❌ Wrong master password or corrupted data!");
      }
    } catch (err) {
      alert("❌ Decryption error!");
      console.error(err);
    }
  }

  return (
    <div className="border p-4 rounded mb-3 bg-white shadow-sm">
      <h2 className="font-semibold">{item.title}</h2>
      <p className="text-sm text-gray-500">{item.username}</p>

      {decrypted ? (
        <div className="text-sm mt-2 space-y-1">
          <p>🔑 Password: {decrypted.password}</p>
          <p>🌐 URL: {decrypted.url}</p>
          <p>📝 Notes: {decrypted.notes}</p>

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(decrypted.password);
                alert("📋 Password copied to clipboard!");
              }}
              className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
            >
              Copy
            </button>

            <button
              onClick={onDelete}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleDecrypt}
          className="text-blue-600 underline text-sm mt-2"
        >
          Decrypt
        </button>
      )}
    </div>
  );
}
