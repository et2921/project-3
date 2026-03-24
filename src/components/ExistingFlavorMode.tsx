"use client";

import { useState } from "react";
import { HumorFlavor } from "@/types";
import { CaptionGenerator } from "./CaptionGenerator";

interface Props {
  flavors: HumorFlavor[];
  onBack: () => void;
}

export function ExistingFlavorMode({ flavors, onBack }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <div>
      <BackButton onBack={onBack} />
      <h2 className="text-2xl font-bold mb-1">Existing Flavor</h2>
      <p className="text-gray-400 text-sm mb-6">Choose a humor flavor to generate captions</p>

      {selectedId === null ? (
        <div className="space-y-2 max-w-lg">
          {flavors.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-3">🍽️</p>
              <p>No flavors yet. Create one first.</p>
            </div>
          ) : (
            flavors.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedId(f.id)}
                className="w-full text-left px-4 py-3.5 rounded-xl border border-gray-800 bg-gray-900/50 hover:border-blue-500/40 hover:bg-blue-950/20 transition-all group"
              >
                <div className="font-medium group-hover:text-blue-300 transition-colors">{f.description}</div>
                <div className="text-xs text-gray-500 mt-0.5">/{f.slug}</div>
              </button>
            ))
          )}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedId(null)}
            className="text-sm text-gray-500 hover:text-gray-300 mb-5 transition-colors flex items-center gap-1"
          >
            ← Change flavor
          </button>
          <CaptionGenerator flavorId={selectedId} />
        </div>
      )}
    </div>
  );
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 mb-6 transition-colors"
    >
      ← Back
    </button>
  );
}
