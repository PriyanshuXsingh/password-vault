"use client";

import { useState } from "react";
import { encryptData } from "@/lib/crypto";

export default function PasswordGenerator({
  masterPassword,
  token,
  onSaved,
}: {
  masterPassword: string;
  token: string;
  onSaved?: () => void;
}) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = (len = 16) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let p = "";
    for (let i = 0; i < len; i++) p += chars.charAt(Math.floor(Math.random() * chars.length));
    setPassword(p);
  };

  const save = async () => {
    if (!password) return alert("Generate password first");
    if (!masterPassword) return alert("Enter master password on Vault page first");
    if (!token) return alert("You must be logged in");

    setLoading(true);
    try {
      const salt = "vault_salt";
      const plain = {
        title: name || "Untitled",
        username: "N/A",
        password,
        url: "",
        notes: "",
      };

      const encrypted = await encryptData(JSON.stringify(plain), masterPassword, salt);
      // encrypted.cipher = base64, encrypted.iv = base64 (per lib/crypto.ts)

      const res = await fetch("/api/vault", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: plain.title,
          username: plain.username,
          password: encrypted.cipher,
          url: plain.url,
          notes: plain.notes,
          iv: encrypted.iv, // IMPORTANT: pass iv as base64 string (no JSON.stringify)
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Save failed");
      }

      setName("");
      setPassword("");
      alert("✅ Saved to vault (encrypted)");
      onSaved?.();
    } catch (err: any) {
      console.error("Save error:", err);
      alert("❌ Save failed: " + (err.message || "unknown"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <input
        type="text"
        placeholder="Name (e.g. Gmail)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />
      <div className="flex gap-2 mb-2">
        <button onClick={() => generate(16)} className="bg-green-600 text-white px-3 py-2 rounded">Generate</button>
        <input className="border p-2 rounded w-full" readOnly value={password} placeholder="Generated password" />
      </div>

      <div className="flex gap-2">
        <button onClick={() => { navigator.clipboard.writeText(password); alert("Copied"); }} className="bg-gray-600 text-white px-3 py-1 rounded">Copy</button>
        <button onClick={save} disabled={loading} className="bg-blue-600 text-white px-3 py-1 rounded">
          {loading ? "Saving..." : "Save (encrypted)"}
        </button>
      </div>
    </div>
  );
}
