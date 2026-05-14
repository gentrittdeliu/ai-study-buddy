import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function createFallbackResponse(prompt: string, mode: string) {
  return `
AI Study Buddy Demo Response

Mode: ${mode}

Topic: ${prompt}

This is a fallback AI response because OpenAI quota or billing is not active.

Example explanation:
${prompt} is an important study topic.
You should understand the main concepts, practice examples, and review the material regularly for better learning.
`;
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const body = await req.json();

    const prompt = body.prompt;
    const mode = body.mode || "Explain";

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    try {
      const completion = await Promise.race([
        openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are an AI Study Buddy.

Mode: ${mode}

Rules:
- Explain clearly
- Use simple language
- Help the student understand
- If mode is Quiz, create questions
- If mode is Summary, summarize
- If mode is Flashcards, create flashcards
- If mode is Explain, explain the topic`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 15000)
        ),
      ]);

      const aiReply =
        (completion as OpenAI.Chat.Completions.ChatCompletion).choices[0]
          ?.message?.content || "No response";

      return NextResponse.json({
        reply: aiReply,
      });
    } catch (openaiError) {
      console.log("OpenAI fallback mode activated");

      return NextResponse.json({
        reply: createFallbackResponse(prompt, mode),
      });
    }
  } catch (error) {
    console.error("API chat error:", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}