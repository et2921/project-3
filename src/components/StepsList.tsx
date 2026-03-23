"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { createClient } from "@/lib/supabase/client";
import { HumorFlavorStep, LlmInputType, LlmOutputType, LlmModel, HumorFlavorStepType } from "@/types";
import { StepFormModal } from "./StepFormModal";

interface Props {
  flavorId: number;
  initialSteps: HumorFlavorStep[];
  inputTypes: LlmInputType[];
  outputTypes: LlmOutputType[];
  models: LlmModel[];
  stepTypes: HumorFlavorStepType[];
  userId: string;
}

export function StepsList({ flavorId, initialSteps, inputTypes, outputTypes, models, stepTypes, userId }: Props) {
  const [steps, setSteps] = useState<HumorFlavorStep[]>(initialSteps);
  const [showCreate, setShowCreate] = useState(false);
  const [editStep, setEditStep] = useState<HumorFlavorStep | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  async function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const from = result.source.index;
    const to = result.destination.index;
    if (from === to) return;

    const reordered = [...steps];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);

    const updated = reordered.map((s, i) => ({ ...s, order_by: i + 1 }));
    setSteps(updated);

    const supabase = createClient();
    await Promise.all(
      updated.map((s) =>
        supabase
          .from("humor_flavor_steps")
          .update({ order_by: s.order_by })
          .eq("id", s.id)
      )
    );
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this step?")) return;
    setDeleting(id);
    const supabase = createClient();
    await supabase.from("humor_flavor_steps").delete().eq("id", id);
    const remaining = steps.filter((s) => s.id !== id).map((s, i) => ({ ...s, order_by: i + 1 }));
    setSteps(remaining);
    await Promise.all(
      remaining.map((s) =>
        supabase.from("humor_flavor_steps").update({ order_by: s.order_by }).eq("id", s.id)
      )
    );
    setDeleting(null);
  }

  function handleSaved(step: HumorFlavorStep) {
    setSteps((prev) => {
      const exists = prev.find((s) => s.id === step.id);
      if (exists) return prev.map((s) => (s.id === step.id ? step : s));
      return [...prev, { ...step, order_by: prev.length + 1 }];
    });
    setShowCreate(false);
    setEditStep(null);
  }

  const inputTypeMap = Object.fromEntries(inputTypes.map((t) => [t.id, t.description]));
  const outputTypeMap = Object.fromEntries(outputTypes.map((t) => [t.id, t.description]));
  const modelMap = Object.fromEntries(models.map((m) => [m.id, m.name]));
  const stepTypeMap = Object.fromEntries(stepTypes.map((t) => [t.id, t.description]));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Steps <span className="text-gray-400 font-normal text-sm">({steps.length})</span></h2>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          + Add Step
        </button>
      </div>

      {steps.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No steps yet. Add a step to define the prompt chain.</p>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="steps">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {steps.map((step, index) => (
                  <Draggable key={step.id} draggableId={String(step.id)} index={index}>
                    {(draggable, snapshot) => (
                      <div
                        ref={draggable.innerRef}
                        {...draggable.draggableProps}
                        className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                          snapshot.isDragging
                            ? "border-blue-400 bg-blue-50 dark:bg-blue-950/30 shadow-lg"
                            : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                        }`}
                      >
                        <div
                          {...draggable.dragHandleProps}
                          className="mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-grab active:cursor-grabbing shrink-0"
                          title="Drag to reorder"
                        >
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <circle cx="5" cy="4" r="1.5" /><circle cx="11" cy="4" r="1.5" />
                            <circle cx="5" cy="8" r="1.5" /><circle cx="11" cy="8" r="1.5" />
                            <circle cx="5" cy="12" r="1.5" /><circle cx="11" cy="12" r="1.5" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-400 shrink-0">Step {step.order_by}</span>
                            <span className="font-medium truncate">{step.description}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">{stepTypeMap[step.humor_flavor_step_type_id] ?? step.humor_flavor_step_type_id}</span>
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">{modelMap[step.llm_model_id] ?? step.llm_model_id}</span>
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">in: {inputTypeMap[step.llm_input_type_id] ?? step.llm_input_type_id}</span>
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">out: {outputTypeMap[step.llm_output_type_id] ?? step.llm_output_type_id}</span>
                            {step.llm_temperature !== null && (
                              <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">temp: {step.llm_temperature}</span>
                            )}
                          </div>
                          {step.llm_user_prompt && (
                            <p className="text-xs text-gray-400 mt-1 truncate">{step.llm_user_prompt}</p>
                          )}
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => setEditStep(step)}
                            className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(step.id)}
                            disabled={deleting === step.id}
                            className="px-2.5 py-1 text-xs rounded-lg border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50 transition-colors"
                          >
                            {deleting === step.id ? "..." : "Del"}
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {(showCreate || editStep) && (
        <StepFormModal
          flavorId={flavorId}
          step={editStep ?? undefined}
          nextOrder={steps.length + 1}
          inputTypes={inputTypes}
          outputTypes={outputTypes}
          models={models}
          stepTypes={stepTypes}
          userId={userId}
          onClose={() => { setShowCreate(false); setEditStep(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
