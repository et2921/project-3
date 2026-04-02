"use client";

import { useState } from "react";
import Link from "next/link";
import { HumorFlavor, HumorFlavorStep, LlmInputType, LlmOutputType, LlmModel, HumorFlavorStepType } from "@/types";
import { StepsList } from "./StepsList";
import { FlavorFormModal } from "./FlavorFormModal";
import { CaptionGenerator } from "./CaptionGenerator";

interface Props {
  flavor: HumorFlavor;
  initialSteps: HumorFlavorStep[];
  inputTypes: LlmInputType[];
  outputTypes: LlmOutputType[];
  models: LlmModel[];
  stepTypes: HumorFlavorStepType[];
  userToken: string;
  userId: string;
}

export function FlavorDetail({
  flavor: initialFlavor,
  initialSteps,
  inputTypes,
  outputTypes,
  models,
  stepTypes,
  userId,
}: Props) {
  const [flavor, setFlavor] = useState<HumorFlavor>(initialFlavor);
  const [showEdit, setShowEdit] = useState(false);
  const [activeTab, setActiveTab] = useState<"steps" | "test">("steps");

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/flavors" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          Flavors
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-100 font-medium">{flavor.description}</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{flavor.description}</h1>
          <p className="text-sm text-gray-400 mt-1">/{flavor.slug}</p>
        </div>
        <button
          onClick={() => setShowEdit(true)}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Edit name
        </button>
      </div>

      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab("steps")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === "steps"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Steps
        </button>
        <button
          onClick={() => setActiveTab("test")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === "test"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Test (Generate Captions)
        </button>
      </div>

      {activeTab === "steps" ? (
        <StepsList
          flavorId={flavor.id}
          initialSteps={initialSteps}
          inputTypes={inputTypes}
          outputTypes={outputTypes}
          models={models}
          stepTypes={stepTypes}
          userId={userId}
        />
      ) : initialSteps.length === 0 ? (
        <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 text-sm">
          This flavor has no steps yet. Add steps in the Steps tab before generating captions.
        </div>
      ) : (
        <CaptionGenerator flavorId={flavor.id} />
      )}

      {showEdit && (
        <FlavorFormModal
          flavor={flavor}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => { setFlavor(updated); setShowEdit(false); }}
        />
      )}
    </div>
  );
}
