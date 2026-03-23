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
  const [description, setDescription] = useState(step?.description ?? "");
  const [systemPrompt, setSystemPrompt] = useState(step?.llm_system_prompt ?? "");
  const [userPrompt, setUserPrompt] = useState(step?.llm_user_prompt ?? "");
  const [temperature, setTemperature] = useState(String(step?.llm_temperature ?? 0.7));
  const [inputTypeId, setInputTypeId] = useState(step?.llm_input_type_id ?? inputTypes[0]?.id ?? 1);
  const [outputTypeId, setOutputTypeId] = useState(step?.llm_output_type_id ?? outputTypes[0]?.id ?? 1);
  const [modelId, setModelId] = useState(step?.llm_model_id ?? models[0]?.id ?? 1);
  const [stepTypeId, setStepTypeId] = useState(step?.humor_flavor_step_type_id ?? stepTypes[0]?.id ?? 1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedModel = models.find((m) => m.id === Number(modelId));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const supabase = createClient();
    const payload = {
      humor_flavor_id: flavorId,
      description: description.trim(),
      llm_system_prompt: systemPrompt.trim(),
      llm_user_prompt: userPrompt.trim(),
      llm_temperature: selectedModel?.is_temperature_supported ? parseFloat(temperature) : 0.7,
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
        <h2 className="text-lg font-semibold mb-5">{step ? "Edit Step" : "New Step"}</h2>
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
            <Field label="Step Type">
              <select value={stepTypeId} onChange={(e) => setStepTypeId(Number(e.target.value))} className={inputClass}>
                {stepTypes.map((t) => <option key={t.id} value={t.id}>{t.description}</option>)}
              </select>
            </Field>
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
            <Field label="Output Type">
              <select value={outputTypeId} onChange={(e) => setOutputTypeId(Number(e.target.value))} className={inputClass}>
                {outputTypes.map((t) => <option key={t.id} value={t.id}>{t.description}</option>)}
              </select>
            </Field>
          </div>

          {selectedModel?.is_temperature_supported && (
            <Field label={`Temperature: ${temperature}`}>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
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
              rows={3}
              placeholder="User message / instructions"
              className={inputClass}
            />
          </Field>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors">
              {saving ? "Saving..." : "Save"}
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
