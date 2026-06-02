import type { AiClientSettings } from '../utils/aiSettingsCore';

export interface AiModelsListRequest {
  clientSettings?: AiClientSettings;
}

export interface AiModelsListResponse {
  success: boolean;
  models: string[];
  visionModels: string[];
  suggestedVisionModel?: string;
  error?: {
    code: string;
    message: string;
  };
}
