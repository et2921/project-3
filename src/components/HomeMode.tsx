"use client";

import { useState } from "react";
import { HumorFlavor, LlmInputType, LlmOutputType, LlmModel, HumorFlavorStepType } from "@/types";
import { ExistingFlavorMode } from "./ExistingFlavorMode";
import { MixMode } from "./MixMode";
import { NewFlavorWizard } from "./NewFlavorWizard";
import { IFeelFunnyMode } from "./IFeelFunnyMode";

type Mode = "existing" | "mix" | "new" | "funny" | null;

interface Props {
  flavors: HumorFlavor[];
  inputTypes: LlmInputType[];
  outputTypes: LlmOutputType[];
  models: LlmModel[];
  stepTypes: HumorFlavorStepType[];
}

const MODES = [
  {
    id: "existing" as const,
    title: "Existing Flavor",
    description: "Use a saved humor flavor to generate captions",
    emoji: "🎨",
    card: "border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/5 hover:border-blue-400/60 hover:from-blue-500/20",
  },
  {
    id: "mix" as const,
    title: "Mix",
    description: "Let randomness surprise you with a mystery flavor",
    emoji: "🎲",
    card: "border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-600/5 hover:border-purple-400/60 hover:from-purple-500/20",
  },
  {
    id: "new" as const,
    title: "New Flavor",
    description: "Build a custom humor style with AI assistance",
    emoji: "✨",
    card: "border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 hover:border-emerald-400/60 hover:from-emerald-500/20",
  },
  {
    id: "funny" as const,
    title: "I Feel Funny",
    description: "Upload a photo and write your own caption",
    emoji: "😄",
    card: "border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-600/5 hover:border-orange-400/60 hover:from-orange-500/20",
  },
];

export function HomeMode({ flavors, inputTypes, outputTypes, models, stepTypes }: Props) {
  const [mode, setMode] = useState<Mode>(null);

  if (mode === "existing") return <ExistingFlavorMode flavors={flavors} onBack={() => setMode(null)} />;
  if (mode === "mix") return <MixMode flavors={flavors} onBack={() => setMode(null)} />;
  if (mode === "new") return (
    <NewFlavorWizard
      inputTypes={inputTypes}
      outputTypes={outputTypes}
      models={models}
      stepTypes={stepTypes}
      onBack={() => setMode(null)}
    />
  );
  if (mode === "funny") return <IFeelFunnyMode onBack={() => setMode(null)} />;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12 pt-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 mb-5 text-3xl">
          🤣
        </div>
        <h1 className="text-4xl font-bold mb-3">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Caption Generator
          </span>
        </h1>
        <p className="text-gray-400 text-lg">What kind of caption are we making today?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`group p-6 rounded-2xl border text-left transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 ${m.card}`}
          >
            <div className="text-4xl mb-4">{m.emoji}</div>
            <h2 className="text-lg font-semibold mb-1">{m.title}</h2>
            <p className="text-sm text-gray-400 leading-relaxed">{m.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
