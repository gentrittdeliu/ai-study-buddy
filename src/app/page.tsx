"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "../../lib/supabaseClient";
import { createConversation, saveMessage } from "../../lib/database";

export default function HomePage() {
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [mode, setMode] = useState("Explain");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
    }
  }

  async function handleGenerate() {
    setError("");

    if (!prompt.trim()) {
      setError("Please write a topic before generating.");
      return;
    }

    if (!navigator.onLine) {
      setError("No internet connection. Please try again.");
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!user || !session) {
        setError("Please login first.");
        router.push("/auth");
        return;
      }

      let currentConversationId = conversationId;

      if (!currentConversationId) {
        const conversation = await createConversation(user.id);

        if (!conversation) {
          setError("Could not create conversation.");
          return;
        }

        currentConversationId = conversation.id;
        setConversationId(conversation.id);
      }

      await saveMessage(currentConversationId, "user", prompt);

      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 15000);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          prompt,
          mode,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI request failed.");
      }

      const aiResponse =
        data.result ||
        data.reply ||
        data.message ||
        "No response";

      setReply(aiResponse);

      await saveMessage(currentConversationId, "assistant", aiResponse);
      setPrompt("");
    } catch (error: any) {
      console.error(error);

      if (error.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        setError(error.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1>AI Study Buddy</h1>

        <button
          onClick={handleLogout}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <button onClick={() => setMode("Explain")}>Explain</button>
        <button onClick={() => setMode("Summary")}>Summary</button>
        <button onClick={() => setMode("Quiz")}>Quiz</button>
        <button onClick={() => setMode("Flashcards")}>Flashcards</button>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Write your topic..."
        disabled={loading}
        style={{
          width: "100%",
          height: "150px",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "10px",
          color: "white",
          background: "#1e293b",
        }}
      />

      {error && (
        <p
          style={{
            color: "#f87171",
            marginBottom: "15px",
          }}
        >
          {error}
        </p>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          padding: "12px 24px",
          borderRadius: "10px",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          marginBottom: "30px",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {error && (
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            padding: "12px 24px",
            borderRadius: "10px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            marginLeft: "10px",
            opacity: loading ? 0.7 : 1,
          }}
        >
          Retry
        </button>
      )}

      {loading && (
        <p style={{ color: "#38bdf8", marginBottom: "20px" }}>
          AI is generating your response...
        </p>
      )}

      {reply && (
        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            whiteSpace: "pre-wrap",
          }}
        >
          {reply}
        </div>
      )}
    </main>
  );
}