"use client";

import { useState } from "react";
import Link from "next/link";
import { HumorFlavor } from "@/types";
import { FlavorFormModal } from "./FlavorFormModal";

export function FlavorsList({ initialFlavors }: { initialFlavors: HumorFlavor[] }) {
  const [flavors, setFlavors] = useState<HumorFlavor[]>(initialFlavors);
  const [showCreate, setShowCreate] = useState(false);

  function handleCreated(flavor: HumorFlavor) {
    setFlavors((prev) => [flavor, ...prev]);
    setShowCreate(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Humor Flavors</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          + New Flavor
        </button>
      </div>

      {flavors.length === 0 ? (
        <p className="text-gray-500 text-center py-16">No humor flavors yet. Create one to get started.</p>
      ) : (
        <div className="space-y-3">
          {flavors.map((flavor) => (
            <div
              key={flavor.id}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
            >
              <div className="min-w-0">
                <Link
                  href={`/flavors/${flavor.id}`}
                  className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate block"
                >
                  {flavor.description}
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">/{flavor.slug}</p>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <Link
                  href={`/flavors/${flavor.id}`}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <FlavorFormModal
          onClose={() => setShowCreate(false)}
          onSaved={handleCreated}
        />
      )}
    </div>
  );
}
