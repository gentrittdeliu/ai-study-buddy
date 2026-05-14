"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    setLoading(true);
    setMessage("");

    const result =
      mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setMessage(result.error.message);
      setLoading(false);
      return;
    }

    if (mode === "login") {
      router.push("/");
    } else {
      setMessage("Account created successfully. Now login.");
      setMode("login");
    }

    setLoading(false);
  }

  return (
    <main style={{ maxWidth: 400, margin: "80px auto", fontFamily: "Arial" }}>
      <h1>{mode === "login" ? "Login" : "Create Account"}</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: 12, marginTop: 12 }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: 12, marginTop: 12 }}
      />

      <button
        onClick={handleAuth}
        disabled={loading}
        style={{ width: "100%", padding: 12, marginTop: 16 }}
      >
        {loading ? "Loading..." : mode === "login" ? "Login" : "Create Account"}
      </button>

      <button
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
        style={{ width: "100%", padding: 12, marginTop: 10 }}
      >
        {mode === "login"
          ? "Need an account? Sign up"
          : "Already have an account? Login"}
      </button>

      {message && <p style={{ marginTop: 20 }}>{message}</p>}
    </main>
  );
}