import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { notes, type } = await req.json();

    if (!notes || !type) {
      return Response.json(
        { error: "Missing notes or type" },
        { status: 400 }
      );
    }

    let prompt = "";

    if (type === "summary") {
      prompt = `Permbledh keto shenime ne pika kryesore:\n${notes}`;
    }

    if (type === "quiz") {
      prompt = `Krijo 5 pyetje quiz me pergjigje nga keto shenime:\n${notes}`;
    }

    if (type === "flashcards") {
      prompt = `Krijo flashcards nga keto shenime. Secila flashcard duhet te kete pyetje dhe pergjigje:\n${notes}`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
Ti je AI Study Buddy per studente fillestare.
Pergjigju gjithmone ne shqip.
Jep pergjigje te qarta, te shkurtra dhe te dobishme.
Kthe vetem JSON ne kete format:
{
  "title": "Titulli",
  "content": "Pershkrimi kryesor",
  "items": ["pika 1", "pika 2", "pika 3"]
}
`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const result = completion.choices[0].message.content;

    return Response.json(JSON.parse(result || "{}"));
  } catch (error) {
    return Response.json(
      { error: "Something went wrong with AI API" },
      { status: 500 }
    );
  }
}