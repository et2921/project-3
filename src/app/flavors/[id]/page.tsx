import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { FlavorDetail } from "@/components/FlavorDetail";

export const dynamic = "force-dynamic";

export default async function FlavorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: flavor },
    { data: steps },
    { data: inputTypes },
    { data: outputTypes },
    { data: models },
    { data: stepTypes },
  ] = await Promise.all([
    supabase.from("humor_flavors").select("*").eq("id", id).single(),
    supabase.from("humor_flavor_steps").select("*").eq("humor_flavor_id", id).order("order_by"),
    supabase.from("llm_input_types").select("*"),
    supabase.from("llm_output_types").select("*"),
    supabase.from("llm_models").select("*").order("name"),
    supabase.from("humor_flavor_step_types").select("*"),
  ]);

  if (!flavor) notFound();

  const { data: { user } } = await supabase.auth.getUser();

  return (
    <FlavorDetail
      flavor={flavor}
      initialSteps={steps ?? []}
      inputTypes={inputTypes ?? []}
      outputTypes={outputTypes ?? []}
      models={models ?? []}
      stepTypes={stepTypes ?? []}
      userToken=""
      userId={user?.id ?? ""}
    />
  );
}
