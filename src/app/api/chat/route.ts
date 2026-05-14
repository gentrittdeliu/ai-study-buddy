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

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (!body.prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an AI Study Buddy.

Mode: ${body.mode}

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
            content: body.prompt,
          },
        ],
      });

      const aiReply =
        completion.choices[0]?.message?.content ||
        "No response";

      return NextResponse.json({
        reply: aiReply,
      });

    } catch (openaiError) {

      console.log("OpenAI fallback mode activated");

      const fallbackResponse = `
AI Study Buddy Demo Response

Mode: ${body.mode}

Topic: ${body.prompt}

This is a fallback AI response because OpenAI quota or billing is not active.

Example explanation:
${body.prompt} is an important study topic. 
You should understand the main concepts, practice examples, and review the material regularly for better learning.
`;

      return NextResponse.json({
        reply: fallbackResponse,
      });
    }

  } catch (error) {
    console.error("API chat error:", error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}