"use client";

import { useState } from "react";

export default function Home() {
  const [notes, setNotes] = useState("");
  const [answer, setAnswer] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate(type: string) {
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notes,
        type,
      }),
    });

    const data = await res.json();

    setAnswer(data);
    setLoading(false);
  }

  return (
    <main
      style={{
        padding: "40px",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ fontSize: "40px", marginBottom: "20px" }}>
        AI Study Buddy
      </h1>

      <textarea
        placeholder="Shkruaj shënimet..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={10}
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "16px",
          borderRadius: "10px",
        }}
      />

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "20px",
        }}
      >
        <button onClick={() => handleGenerate("summary")}>
          Përmbledhje
        </button>

        <button onClick={() => handleGenerate("quiz")}>
          Quiz
        </button>

        <button onClick={() => handleGenerate("flashcards")}>
          Flashcards
        </button>
      </div>

      {loading && (
        <p style={{ marginTop: "20px" }}>
          Duke gjeneruar...
        </p>
      )}

      {answer && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            border: "1px solid gray",
            borderRadius: "10px",
          }}
        >
          <h2>{answer.title}</h2>

          <p>{answer.content}</p>

          <ul>
            {answer.items?.map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}