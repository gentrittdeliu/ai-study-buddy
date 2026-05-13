"use client";

import { useState } from "react";

export default function Home() {
  const [notes, setNotes] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notes }),
    });

    const data = await res.json();

    setAnswer(data.answer);

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-6">
        AI Study Buddy
      </h1>

      <textarea
        className="w-full h-52 p-4 rounded text-black"
        placeholder="Shkruaj shenimet ketu..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <button
        onClick={handleGenerate}
        className="mt-4 bg-blue-600 px-6 py-3 rounded"
      >
        {loading ? "Duke gjeneruar..." : "Gjenero"}
      </button>

      {answer && (
        <div className="mt-8 bg-gray-900 p-6 rounded">
          <h2 className="text-2xl font-bold mb-3">
            Pergjigja nga AI
          </h2>

          <p className="whitespace-pre-wrap">
            {answer}
          </p>
        </div>
      )}
    </main>
  );
}