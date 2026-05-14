import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { notes, type } = await req.json();

    let prompt = "";

    if (type === "summary") {
      prompt = `Përmbledh këto shënime:\n${notes}`;
    }

    if (type === "quiz") {
      prompt = `Krijo 5 pyetje quiz nga këto shënime:\n${notes}`;
    }

    if (type === "flashcards") {
      prompt = `Krijo flashcards nga këto shënime:\n${notes}`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
Ti je AI Study Buddy për studentë fillestarë.
Përgjigju në shqip.
Jep përgjigje të qarta dhe të shkurtra.
Kthe përgjigjen vetëm si JSON.

Formati:
{
  "title": "Titulli",
  "content": "Përgjigjja",
  "items": ["item1", "item2"]
}
`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return Response.json(
      JSON.parse(completion.choices[0].message.content || "{}")
    );
  } catch (error) {
    return Response.json({
      error: "Something went wrong",
    });
  }
}