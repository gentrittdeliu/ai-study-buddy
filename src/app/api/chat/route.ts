import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an AI Study Buddy. Summarize notes and create quiz questions.",
        },
        {
          role: "user",
          content: body.notes,
        },
      ],
    });

    return Response.json({
      answer: completion.choices[0].message.content,
    });
  } catch (error) {
    return Response.json({
      error: "Something went wrong",
    });
  }
}