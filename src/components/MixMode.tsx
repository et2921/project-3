"use client";

import { useState, useEffect } from "react";
import { HumorFlavor } from "@/types";
import { CaptionGenerator } from "./CaptionGenerator";

interface Props {
  flavors: HumorFlavor[];
  onBack: () => void;
}

export function MixMode({ flavors, onBack }: Props) {
  const [flavor, setFlavor] = useState<HumorFlavor | null>(null);

  function pickRandom() {
    if (flavors.length > 0) {
      setFlavor(flavors[Math.floor(Math.random() * flavors.length)]);
    }
  }

  useEffect(() => { pickRandom(); }, []);

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 mb-6 transition-colors"
      >
        ← Back
      </button>
      <h2 className="text-2xl font-bold mb-1">🍧 Swirl</h2>
      <p className="text-gray-400 text-sm mb-6">A mystery scoop has been served — no peeking!</p>

      {flavor ? (
        <div>
          <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-teal-950/30 border border-teal-500/30">
            <span className="text-2xl">🎲</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-teal-400 mb-0.5 uppercase tracking-wide">Mystery scoop</p>
              <p className="font-semibold truncate">{flavor.description}</p>
            </div>
            <button
              onClick={pickRandom}
              className="shrink-0 px-3 py-1.5 text-xs rounded-lg border border-teal-500/40 text-teal-300 hover:bg-teal-900/40 transition-colors"
            >
              New Scoop
            </button>
          </div>
          <CaptionGenerator flavorId={flavor.id} />
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-3">🍧</p>
          <p>The freezer is empty. Craft a flavor first.</p>
        </div>
      )}
    </div>
  );
}
