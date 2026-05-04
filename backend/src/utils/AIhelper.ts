import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const ALLOWED_VIBES = [
  "DATING","FRIENDS","FAMILY","SOLO",
  "STREET_FOOD","BUDGET_EATS","PREMIUM_DINING","LOCAL_AUTHENTIC",
  "MUSIC","QUIET","ROMANTIC","LATE_NIGHT",
  "SIGHTSEEING","INSTAGRAM_WORTHY","NATURE","CITY_VIEW",
  "HIDDEN_GEM","UNDER_100","STUDENT_FRIENDLY","QUICK_BITE"
] as const;

type Vibe = typeof ALLOWED_VIBES[number];

export async function generateVibesFromDescription(description: string): Promise<Vibe[]> {
    const prompt = `
    Pick up to 5 vibes for this text.

    Allowed:
    DATING, FRIENDS, FAMILY, SOLO, STREET_FOOD, BUDGET_EATS, PREMIUM_DINING, LOCAL_AUTHENTIC, MUSIC, QUIET, ROMANTIC, LATE_NIGHT, SIGHTSEEING, INSTAGRAM_WORTHY, NATURE, CITY_VIEW, HIDDEN_GEM, UNDER_100, STUDENT_FRIENDLY, QUICK_BITE

    Return JSON array only. No text.

    Text: ${description}
    `;

  const res = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
    max_tokens: 40, 
  });

  const text = res.choices[0].message.content ?? "[]";

  try {
    const parsed = JSON.parse(text) as string[];

    return parsed.filter((v): v is Vibe =>
      ALLOWED_VIBES.includes(v as Vibe)
    );
  } catch {
    return [];
  }
}