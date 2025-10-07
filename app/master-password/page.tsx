"use client";

import { useState } from "react";


export default function MasterPasswordPage() {
  const [password, setPassword] = useState("");

  const handleSave = () => {
    if (!password.trim()) {
      alert("⚠️ Please enter a master password");
      return;
    }
    localStorage.setItem("masterPassword", password);
    alert("✅ Master password saved locally!");
    window.location.href = "/vault"; // Redirect to vault after saving
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-gray-950 text-white">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-xl w-80 flex flex-col items-center gap-4">
        <h1 className="text-2xl font-semibold">Set Master Password 🔐</h1>
        <input
          type="password"
          placeholder="Enter master password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full"
        />
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Save Password
        </button>
      </div>
    </div>
  );
}
