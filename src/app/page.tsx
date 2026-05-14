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
    if (!prompt) return;

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!user || !session) {
        alert("Please login");
        router.push("/auth");
        return;
      }

      let currentConversationId = conversationId;

      if (!currentConversationId) {
        const conversation = await createConversation(user.id);

        if (!conversation) return;

        currentConversationId = conversation.id;
        setConversationId(conversation.id);
      }

      await saveMessage(currentConversationId, "user", prompt);

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
      });

      const data = await response.json();

      const aiResponse =
        data.result ||
        data.reply ||
        data.message ||
        data.error ||
        "No response";

      setReply(aiResponse);

      await saveMessage(currentConversationId, "assistant", aiResponse);
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
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
        style={{
          width: "100%",
          height: "150px",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "20px",
          color: "white",
          background: "#1e293b",
        }}
      />

      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          padding: "12px 24px",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          marginBottom: "30px",
        }}
      >
        {loading ? "Generating..." : "Generate"}
      </button>

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