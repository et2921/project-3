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
    title: "Pick a Scoop",
    description: "Choose a saved flavor and generate captions",
    emoji: "🍦",
    card: "border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-pink-600/5 hover:border-pink-400/60 hover:from-pink-500/20",
  },
  {
    id: "mix" as const,
    title: "Swirl",
    description: "Get a surprise mystery flavor — luck of the scoop",
    emoji: "🍧",
    card: "border-teal-500/30 bg-gradient-to-br from-teal-500/10 to-teal-600/5 hover:border-teal-400/60 hover:from-teal-500/20",
  },
  {
    id: "new" as const,
    title: "Craft a Flavor",
    description: "Churn a brand-new AI-powered humor flavor",
    emoji: "🍨",
    card: "border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-violet-600/5 hover:border-violet-400/60 hover:from-violet-500/20",
  },
  {
    id: "funny" as const,
    title: "I Feel Funny",
    description: "Upload a photo and write your own caption",
    emoji: "🍡",
    card: "border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-600/5 hover:border-amber-400/60 hover:from-amber-500/20",
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
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-violet-500/20 border border-pink-500/20 mb-5 text-3xl">
          🍦
        </div>
        <h1 className="text-4xl font-bold mb-3">
          <span className="bg-gradient-to-r from-pink-400 via-violet-400 to-teal-400 bg-clip-text text-transparent">
            Scoop Studio
          </span>
        </h1>
        <p className="text-gray-400 text-lg">What flavor are we scooping today?</p>
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
