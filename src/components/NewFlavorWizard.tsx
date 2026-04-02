"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LlmInputType, LlmOutputType, LlmModel, HumorFlavorStepType, HumorFlavor, HumorFlavorStep } from "@/types";
import { StepsList } from "./StepsList";
import { CaptionGenerator } from "./CaptionGenerator";

interface Props {
  inputTypes: LlmInputType[];
  outputTypes: LlmOutputType[];
  models: LlmModel[];
  stepTypes: HumorFlavorStepType[];
  onBack: () => void;
}

const HUMOR_TYPES = [
  { value: "Dry Wit", emoji: "😐", desc: "Understated and deadpan" },
  { value: "Sarcastic", emoji: "😏", desc: "Ironic and cutting" },
  { value: "Absurdist", emoji: "🌀", desc: "Weird and surreal" },
  { value: "Dark Humor", emoji: "💀", desc: "Dark and unexpected" },
  { value: "Punny", emoji: "🎭", desc: "Wordplay and puns" },
  { value: "Pop Culture", emoji: "🎬", desc: "References and memes" },
];

const TONES = [
  { value: "Casual", emoji: "😎", desc: "Relaxed and friendly" },
  { value: "Professional", emoji: "👔", desc: "Polished and smart" },
  { value: "Edgy", emoji: "🔥", desc: "Bold and provocative" },
  { value: "Family-Friendly", emoji: "👨‍👩‍👧", desc: "Clean and wholesome" },
];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function NewFlavorWizard({ inputTypes, outputTypes, models, stepTypes, onBack }: Props) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [humorType, setHumorType] = useState("");
  const [tone, setTone] = useState("");
  const [instructions, setInstructions] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [createdFlavor, setCreatedFlavor] = useState<HumorFlavor | null>(null);
  const [initialSteps, setInitialSteps] = useState<HumorFlavorStep[]>([]);
  const [userId, setUserId] = useState("");
  const [activeTab, setActiveTab] = useState<"steps" | "test">("steps");

  const progress = [25, 50, 75, 100][step] ?? 100;

  async function handleGenerate() {
    setGenerating(true);
    setError("");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      setUserId(user.id);

      const { data: flavor, error: flavorErr } = await supabase
        .from("humor_flavors")
        .insert({
          description: name.trim(),
          slug: slugify(name.trim()),
          created_by_user_id: user.id,
          modified_by_user_id: user.id,
        })
        .select()
        .single();

      if (flavorErr) throw new Error(flavorErr.message);

      const res = await fetch("/api/generate-flavor-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flavorName: name, humorType, tone, instructions }),
      });

      if (res.ok) {
        const { steps } = await res.json();

        const imageInput = inputTypes.find((t) => t.slug?.toLowerCase().includes("image")) ?? inputTypes[0];
        const textInput = inputTypes.find((t) => t.slug?.toLowerCase().includes("text")) ?? inputTypes[0];
        const textOutput = outputTypes.find((t) => t.slug?.toLowerCase().includes("text")) ?? outputTypes[0];
        const defaultModel = models[0];
        const defaultStepType = stepTypes[0];

        const stepPayloads = steps.map(
          (s: { description: string; llm_system_prompt: string; llm_user_prompt: string }, i: number) => ({
            humor_flavor_id: flavor.id,
            order_by: i + 1,
            description: s.description,
            llm_system_prompt: s.llm_system_prompt,
            llm_user_prompt: s.llm_user_prompt,
            llm_temperature: 0.8,
            llm_input_type_id: i === 0 ? (imageInput?.id ?? 1) : (textInput?.id ?? 1),
            llm_output_type_id: textOutput?.id ?? 1,
            llm_model_id: defaultModel?.id ?? 1,
            humor_flavor_step_type_id: defaultStepType?.id ?? 1,
            created_by_user_id: user.id,
            modified_by_user_id: user.id,
          })
        );

        const { data: savedSteps } = await supabase
          .from("humor_flavor_steps")
          .insert(stepPayloads)
          .select();

        setInitialSteps(savedSteps ?? []);
      }

      setCreatedFlavor(flavor);
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }

  if (step === 4 && createdFlavor) {
    return (
      <div>
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 mb-6 transition-colors">
          ← Back
        </button>
        <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-violet-950/30 border border-violet-500/30">
          <span className="text-3xl">✅</span>
          <div>
            <p className="font-semibold text-violet-400">Flavor created! 🎉</p>
            <p className="text-sm text-gray-400">&ldquo;{createdFlavor.description}&rdquo;{initialSteps.length > 0 ? ` — ${initialSteps.length} steps generated` : " — add steps below to use it"}</p>
          </div>
        </div>

        <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab("steps")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === "steps"
                ? "border-violet-500 text-violet-400"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            Steps
          </button>
          <button
            onClick={() => setActiveTab("test")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === "test"
                ? "border-violet-500 text-violet-400"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            Test Captions
          </button>
        </div>

        {activeTab === "steps" ? (
          <StepsList
            flavorId={createdFlavor.id}
            initialSteps={initialSteps}
            inputTypes={inputTypes}
            outputTypes={outputTypes}
            models={models}
            stepTypes={stepTypes}
            userId={userId}
          />
        ) : (
          <CaptionGenerator flavorId={createdFlavor.id} />
        )}
      </div>
    );
  }

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 mb-6 transition-colors">
        ← Back
      </button>

      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span className="font-medium">🍨 Flavor Churner</span>
          <span>Step {step + 1} of 4</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {step === 0 && (
        <div className="max-w-md">
          <h2 className="text-2xl font-bold mb-1">Name your flavor</h2>
          <p className="text-gray-400 text-sm mb-6">Give your new humor style a name</p>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Existential Dread Comedian"
            className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900/80 focus:outline-none focus:ring-2 focus:ring-violet-500 text-base"
            onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep(1)}
          />
          {name && <p className="text-xs text-gray-600 mt-2">/{slugify(name)}</p>}
          <button
            disabled={!name.trim()}
            onClick={() => setStep(1)}
            className="mt-4 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-xl font-medium transition-colors text-sm"
          >
            Continue →
          </button>
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 className="text-2xl font-bold mb-1">Choose humor type</h2>
          <p className="text-gray-400 text-sm mb-6">What kind of funny are we going for?</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl">
            {HUMOR_TYPES.map((h) => (
              <button
                key={h.value}
                onClick={() => { setHumorType(h.value); setStep(2); }}
                className="p-4 rounded-xl border border-gray-700 bg-gray-900/50 hover:border-violet-500/50 hover:bg-violet-950/20 text-left transition-all hover:scale-[1.02]"
              >
                <div className="text-2xl mb-2">{h.emoji}</div>
                <div className="font-medium text-sm">{h.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{h.desc}</div>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(0)} className="mt-6 text-sm text-gray-500 hover:text-gray-300 transition-colors">
            ← Back
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-2xl font-bold mb-1">Set the tone</h2>
          <p className="text-gray-400 text-sm mb-6">How should the captions feel?</p>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            {TONES.map((t) => (
              <button
                key={t.value}
                onClick={() => { setTone(t.value); setStep(3); }}
                className="p-4 rounded-xl border border-gray-700 bg-gray-900/50 hover:border-violet-500/50 hover:bg-violet-950/20 text-left transition-all hover:scale-[1.02]"
              >
                <div className="text-2xl mb-2">{t.emoji}</div>
                <div className="font-medium text-sm">{t.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{t.desc}</div>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(1)} className="mt-6 text-sm text-gray-500 hover:text-gray-300 transition-colors">
            ← Back
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-md">
          <h2 className="text-2xl font-bold mb-1">Any special instructions?</h2>
          <p className="text-gray-400 text-sm mb-6">Optional — add specific themes, references, or rules</p>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={4}
            placeholder="e.g. Always reference 90s movies. Keep captions under 10 words."
            className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900/80 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none"
          />
          {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl border border-gray-700 hover:bg-gray-800 transition-colors text-sm"
            >
              ← Back
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center gap-2 text-sm"
            >
              {generating ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : "🍨 Churn this Flavor"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
