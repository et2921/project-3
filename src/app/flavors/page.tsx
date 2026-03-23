import { createClient } from "@/lib/supabase/server";
import { FlavorsList } from "@/components/FlavorsList";

export const dynamic = "force-dynamic";

export default async function FlavorsPage() {
  const supabase = await createClient();
  const { data: flavors } = await supabase
    .from("humor_flavors")
    .select("*")
    .order("modified_datetime_utc", { ascending: false });

  return (
    <div>
      <FlavorsList initialFlavors={flavors ?? []} />
    </div>
  );
}
