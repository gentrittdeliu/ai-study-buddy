"use client";

import { useState } from "react";

type Answer = {
  title?: string;
  content?: string;
  items?: string[];
  error?: string;
};

export default function Home() {
  const [notes, setNotes] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate(type: string) {
    try {
      if (!notes.trim()) {
        setError("Ju lutem shkruani shenimet para se te gjeneroni.");
        return;
      }

      setLoading(true);
      setError("");
      setAnswer(null);

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

      if (!res.ok) {
        throw new Error("API error");
      }

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setAnswer(data);
    } catch (err) {
      setError("Diçka shkoi keq. Provo perseri.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          maxWidth: "850px",
          margin: "0 auto",
        }}
      >
        <h1 style={{ fontSize: "42px", marginBottom: "10px" }}>
          AI Study Buddy
        </h1>

        <p style={{ color: "#cbd5e1", marginBottom: "25px" }}>
          Shkruaj shenimet dhe AI do te krijoje permbledhje, quiz ose flashcards.
        </p>

        <textarea
          placeholder="Shkruaj shenimet ketu..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={10}
          style={{
            width: "100%",
            padding: "15px",
            fontSize: "16px",
            borderRadius: "12px",
            border: "1px solid #334155",
            background: "#020617",
            color: "white",
            resize: "vertical",
          }}
        />

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "20px",
            flexWrap: "wrap",
          }}
        >
          <button
            disabled={loading}
            onClick={() => handleGenerate("summary")}
            style={buttonStyle}
          >
            Permbledhje
          </button>

          <button
            disabled={loading}
            onClick={() => handleGenerate("quiz")}
            style={buttonStyle}
          >
            Quiz
          </button>

          <button
            disabled={loading}
            onClick={() => handleGenerate("flashcards")}
            style={buttonStyle}
          >
            Flashcards
          </button>

          <button
            disabled={loading}
            onClick={() => {
              setNotes("");
              setAnswer(null);
              setError("");
            }}
            style={clearButtonStyle}
          >
            Pastro
          </button>
        </div>

        {loading && (
          <div
            style={{
              marginTop: "25px",
              padding: "18px",
              borderRadius: "12px",
              background: "#1e293b",
              border: "1px solid #334155",
            }}
          >
            Duke menduar... ju lutem prisni.
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: "25px",
              padding: "18px",
              borderRadius: "12px",
              background: "#7f1d1d",
              border: "1px solid #ef4444",
            }}
          >
            {error}
          </div>
        )}

        {answer && (
          <div
            style={{
              marginTop: "30px",
              padding: "25px",
              border: "1px solid #334155",
              borderRadius: "14px",
              background: "#020617",
            }}
          >
            <h2 style={{ fontSize: "28px", marginBottom: "15px" }}>
              {answer.title}
            </h2>

            <p style={{ color: "#e2e8f0", lineHeight: "1.6" }}>
              {answer.content}
            </p>

            <ul style={{ marginTop: "15px", lineHeight: "1.8" }}>
              {answer.items?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}

const buttonStyle = {
  padding: "12px 18px",
  borderRadius: "10px",
  border: "none",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
};

const clearButtonStyle = {
  padding: "12px 18px",
  borderRadius: "10px",
  border: "1px solid #475569",
  background: "transparent",
  color: "white",
  cursor: "pointer",
};