"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // agar user already logged in hai → redirect vault page par
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/vault");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-center">
        🔐 Secure Password Vault
      </h1>

      <p className="text-gray-300 max-w-md text-center mb-8">
        Generate and store your passwords safely — all data encrypted locally in
        your browser before saving to the cloud.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => router.push("/login")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition"
        >
          Login
        </button>

        <button
          onClick={() => router.push("/signup")}
          className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-lg shadow-md transition"
        >
          Sign Up
        </button>
      </div>

      <footer className="mt-12 text-gray-500 text-sm">
        Privacy-first 🔒 | Built with Next.js + MongoDB
      </footer>
    </div>
  );
}
