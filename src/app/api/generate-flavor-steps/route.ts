import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { flavorName, humorType, tone, instructions } = await req.json();

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: `Design a 3-step prompt chain for an AI caption generator with these properties:
Name: ${flavorName}
Humor type: ${humorType}
Tone: ${tone}
Extra instructions: ${instructions || "none"}

The 3 steps must be:
1. Image analysis — take an image and describe it in plain text
2. Humor transformation — apply the humor style to create funny observations
3. Caption generation — produce exactly 5 short, punchy captions

Return ONLY a raw JSON array (no markdown, no explanation) of exactly 3 objects, each with:
- "description": one sentence explaining what this step does
- "llm_system_prompt": the system prompt for the AI
- "llm_user_prompt": the user prompt/instruction`,
      },
    ],
  });

  const raw = (message.content[0] as { type: string; text: string }).text;
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const steps = JSON.parse(cleaned);

  return NextResponse.json({ steps });
}
