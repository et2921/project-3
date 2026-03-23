"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { HumorFlavor } from "@/types";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface Props {
  flavor?: HumorFlavor;
  onClose: () => void;
  onSaved: (flavor: HumorFlavor) => void;
}

export function FlavorFormModal({ flavor, onClose, onSaved }: Props) {
  const [description, setDescription] = useState(flavor?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setSaving(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Not authenticated"); setSaving(false); return; }

    if (flavor) {
      const { data, error: err } = await supabase
        .from("humor_flavors")
        .update({
          description: description.trim(),
          modified_by_user_id: user.id,
          modified_datetime_utc: new Date().toISOString(),
        })
        .eq("id", flavor.id)
        .select()
        .single();

      if (err) { setError(err.message); setSaving(false); return; }
      onSaved(data);
    } else {
      const { data, error: err } = await supabase
        .from("humor_flavors")
        .insert({
          description: description.trim(),
          slug: slugify(description.trim()),
          created_by_user_id: user.id,
          modified_by_user_id: user.id,
        })
        .select()
        .single();

      if (err) { setError(err.message); setSaving(false); return; }
      onSaved(data);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
        <h2 className="text-lg font-semibold mb-4">
          {flavor ? "Edit Flavor" : "New Humor Flavor"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              autoFocus
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Dry wit with pop culture"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {description && (
              <p className="text-xs text-gray-400 mt-1">Slug: /{slugify(description)}</p>
            )}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !description.trim()}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
