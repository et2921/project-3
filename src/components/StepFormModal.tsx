"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { HumorFlavorStep, LlmInputType, LlmOutputType, LlmModel, HumorFlavorStepType } from "@/types";

interface Props {
  flavorId: number;
  step?: HumorFlavorStep;
  nextOrder: number;
  inputTypes: LlmInputType[];
  outputTypes: LlmOutputType[];
  models: LlmModel[];
  stepTypes: HumorFlavorStepType[];
  userId: string;
  onClose: () => void;
  onSaved: (step: HumorFlavorStep) => void;
}

const STEP_TEMPLATES: Record<number, { description: string; systemPrompt: string; userPrompt: string }> = {
  1: {
    description: "Describe the image",
    systemPrompt: "You are an image analysis assistant. Describe what you see clearly and concisely.",
    userPrompt: "Describe this image in plain text. Focus on the main subjects, setting, actions, and mood.",
  },
  2: {
    description: "Apply humor transformation",
    systemPrompt: "You are a comedian. Take an image description and find the funny angle.",
    userPrompt: "Here is an image description: ${step1Output}\n\nWrite 3-5 funny observations about it.",
  },
  3: {
    description: "Generate captions",
    systemPrompt: "You are a social media caption writer. Return only a JSON array of strings, no other text.",
    userPrompt: "Image description: ${step1Output}\nHumor observations: ${step2Output}\n\nWrite 5 short funny captions. Return as a JSON array of strings.",
  },
};

export function StepFormModal({
  flavorId,
  step,
  nextOrder,
  inputTypes,
  outputTypes,
  models,
  stepTypes,
  userId,
  onClose,
  onSaved,
}: Props) {
  const template = !step ? (STEP_TEMPLATES[nextOrder] ?? STEP_TEMPLATES[2]) : null;

  const imageInput = inputTypes.find((t) => t.slug?.includes("image")) ?? inputTypes[0];
  const textInput = inputTypes.find((t) => t.slug?.includes("text")) ?? inputTypes[0];
  const stringOutput = outputTypes.find((t) => t.slug === "string") ?? outputTypes[0];
  const arrayOutput = outputTypes.find((t) => t.slug === "array") ?? outputTypes[outputTypes.length - 1];

  // Step types by slug
  const imageDescType = stepTypes.find((t) => t.slug === "image-description") ?? stepTypes[0];
  const generalType = stepTypes.find((t) => t.slug === "general") ?? stepTypes[stepTypes.length - 1];

  const defaultInputType = !step
    ? (nextOrder === 1 ? (imageInput?.id ?? 1) : (textInput?.id ?? 2))
    : step.llm_input_type_id;

  // Step 3 outputs an array; steps 1 and 2 output strings
  const defaultOutputType = !step
    ? (nextOrder === 3 ? (arrayOutput?.id ?? 2) : (stringOutput?.id ?? 1))
    : step.llm_output_type_id;

  // Image step → image-description type; text step → general type
  const defaultStepType = !step
    ? (nextOrder === 1 ? (imageDescType?.id ?? 2) : (generalType?.id ?? 3))
    : step.humor_flavor_step_type_id;

  const [description, setDescription] = useState(step?.description ?? template?.description ?? "");
  const [systemPrompt, setSystemPrompt] = useState(step?.llm_system_prompt ?? template?.systemPrompt ?? "");
  const [userPrompt, setUserPrompt] = useState(step?.llm_user_prompt ?? template?.userPrompt ?? "");
  const [temperature, setTemperature] = useState(String(step?.llm_temperature ?? 0.7));
  const [inputTypeId, setInputTypeId] = useState(defaultInputType);
  const [outputTypeId] = useState(defaultOutputType);
  const [modelId, setModelId] = useState(step?.llm_model_id ?? models[0]?.id ?? 1);
  const [stepTypeId] = useState(defaultStepType);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedModel = models.find((m) => m.id === Number(modelId));

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const supabase = createClient();
    const payload = {
      humor_flavor_id: flavorId,
      description: description.trim(),
      llm_system_prompt: systemPrompt.trim(),
      llm_user_prompt: userPrompt.trim(),
      llm_temperature: selectedModel?.is_temperature_supported ? parseFloat(temperature) : null,
      llm_input_type_id: Number(inputTypeId),
      llm_output_type_id: Number(outputTypeId),
      llm_model_id: Number(modelId),
      humor_flavor_step_type_id: Number(stepTypeId),
      modified_by_user_id: userId,
      modified_datetime_utc: new Date().toISOString(),
    };

    if (step) {
      const { data, error: err } = await supabase
        .from("humor_flavor_steps")
        .update(payload)
        .eq("id", step.id)
        .select()
        .single();
      if (err) { setError(err.message); setSaving(false); return; }
      onSaved(data);
    } else {
      const { data, error: err } = await supabase
        .from("humor_flavor_steps")
        .insert({ ...payload, order_by: nextOrder, created_by_user_id: userId })
        .select()
        .single();
      if (err) { setError(err.message); setSaving(false); return; }
      onSaved(data);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 my-4">
        <h2 className="text-lg font-semibold mb-1">{step ? "Edit Step" : `New Step ${nextOrder}`}</h2>
        {!step && (
          <p className="text-sm text-gray-400 mb-5">
            {nextOrder === 1 && "Step 1 — analyzes the image and describes it in text."}
            {nextOrder === 2 && "Step 2 — takes the description and applies your humor style."}
            {nextOrder === 3 && "Step 3 — generates the final captions from the humor observations."}
            {nextOrder > 3 && "Additional processing step."}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Description">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this step does"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Model">
              <select value={modelId} onChange={(e) => setModelId(Number(e.target.value))} className={inputClass}>
                {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </Field>
            <Field label="Input Type">
              <select value={inputTypeId} onChange={(e) => setInputTypeId(Number(e.target.value))} className={inputClass}>
                {inputTypes.map((t) => <option key={t.id} value={t.id}>{t.description}</option>)}
              </select>
            </Field>
          </div>

          {selectedModel?.is_temperature_supported && (
            <Field label={`Temperature: ${temperature}`}>
              <input
                type="range" min="0" max="2" step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full accent-blue-600"
              />
            </Field>
          )}

          <Field label="System Prompt">
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={3}
              placeholder="System instructions for the model"
              className={inputClass}
            />
          </Field>

          <Field label="User Prompt">
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              rows={4}
              placeholder="Use ${step1Output}, ${step2Output} to reference previous steps"
              className={inputClass}
            />
          </Field>

          <p className="text-xs text-gray-500">
            Use <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{"${step1Output}"}</code>, <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{"${step2Output}"}</code> to reference previous steps.
          </p>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors">
              {saving ? "Saving..." : "Save Step"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
    </div>
  );
}
