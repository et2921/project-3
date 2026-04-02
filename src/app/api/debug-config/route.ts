import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const [
    { data: inputTypes },
    { data: outputTypes },
    { data: stepTypes },
    { data: models },
    { data: steps },
  ] = await Promise.all([
    supabase.from("llm_input_types").select("*"),
    supabase.from("llm_output_types").select("*"),
    supabase.from("humor_flavor_step_types").select("*"),
    supabase.from("llm_models").select("*").order("name"),
    supabase.from("humor_flavor_steps").select("*").limit(5).order("id", { ascending: false }),
  ]);

  return NextResponse.json({ inputTypes, outputTypes, stepTypes, models, recentSteps: steps });
}
