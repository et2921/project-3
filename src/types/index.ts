export interface Profile {
  id: string;
  is_superadmin: boolean;
  is_matrix_admin: boolean;
}

export interface HumorFlavor {
  id: number;
  description: string;
  slug: string;
  created_datetime_utc: string;
  modified_datetime_utc: string;
  created_by_user_id: string;
  modified_by_user_id: string;
}

export interface HumorFlavorStep {
  id: number;
  humor_flavor_id: number;
  order_by: number;
  description: string;
  llm_temperature: number;
  llm_input_type_id: number;
  llm_output_type_id: number;
  llm_model_id: number;
  humor_flavor_step_type_id: number;
  llm_system_prompt: string;
  llm_user_prompt: string;
  created_datetime_utc: string;
  modified_datetime_utc: string;
  created_by_user_id: string;
  modified_by_user_id: string;
}

export interface LlmInputType {
  id: number;
  description: string;
  slug: string;
}

export interface LlmOutputType {
  id: number;
  description: string;
  slug: string;
}

export interface LlmModel {
  id: number;
  name: string;
  provider_model_id: string;
  is_temperature_supported: boolean;
  llm_provider_id: number;
}

export interface HumorFlavorStepType {
  id: number;
  description: string;
  slug: string;
}

export interface Caption {
  id: string;
  caption_text?: string;
  caption?: string;
  [key: string]: unknown;
}
