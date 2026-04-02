import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { imageUrl, flavorId } = await req.json();

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: steps, error: stepsErr } = await supabase
    .from("humor_flavor_steps")
    .select("*")
    .eq("humor_flavor_id", flavorId)
    .order("order_by");

  if (stepsErr || !steps?.length) {
    return NextResponse.json({ error: "No steps found for this flavor" }, { status: 404 });
  }

  const { data: inputTypes } = await supabase.from("llm_input_types").select("id, slug");
  const imageTypeIds = new Set(
    inputTypes?.filter((t) => t.slug?.toLowerCase().includes("image")).map((t) => t.id) ?? []
  );

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  let previousOutput = "";

  for (const step of steps) {
    const isImageStep = imageTypeIds.has(step.llm_input_type_id);
    const userContent = step.llm_user_prompt.replace(/\{\{input\}\}/g, previousOutput);

    const messageContent = isImageStep
      ? [
          { type: "image" as const, source: { type: "url" as const, url: imageUrl } },
          { type: "text" as const, text: userContent },
        ]
      : userContent;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      system: step.llm_system_prompt || undefined,
      messages: [{ role: "user", content: messageContent }],
    });

    previousOutput = (response.content[0] as { type: string; text: string }).text.trim();
  }

  const cleaned = previousOutput.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);
  const captions = Array.isArray(parsed) ? parsed : [parsed];

  return NextResponse.json(captions);
}
