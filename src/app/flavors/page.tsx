import { createClient } from "@/lib/supabase/server";
import { HomeMode } from "@/components/HomeMode";

export const dynamic = "force-dynamic";

export default async function FlavorsPage() {
  const supabase = await createClient();

  const [
    { data: flavors },
    { data: inputTypes },
    { data: outputTypes },
    { data: models },
    { data: stepTypes },
  ] = await Promise.all([
    supabase.from("humor_flavors").select("*").order("description"),
    supabase.from("llm_input_types").select("*"),
    supabase.from("llm_output_types").select("*"),
    supabase.from("llm_models").select("*").order("name"),
    supabase.from("humor_flavor_step_types").select("*"),
  ]);

  return (
    <HomeMode
      flavors={flavors ?? []}
      inputTypes={inputTypes ?? []}
      outputTypes={outputTypes ?? []}
      models={models ?? []}
      stepTypes={stepTypes ?? []}
    />
  );
}
