export type {
  AiApiRunRequest,
  AiApiResponse,
  AiApiErrorBody,
  AiApiErrorCode,
  AiApiResponseMeta,
  AiImageInput,
  StructuredMultimodalInput,
  StructuredMultimodalOutput,
  AiTaskDefinition,
  AiTaskContext,
  AiTaskRunOptions,
  AiModelsListRequest,
  AiModelsListResponse,
  ConnectivityTestOutput,
} from './types';

export {
  aiApiClient,
  runAiTask,
  runAiTaskOrThrow,
  createAiTaskRunner,
  AiApiClientError,
} from './services/aiApiClient';

export { useAiTask } from './hooks/useAiTask';

export { useAiModels } from './hooks/useAiModels';
export type { UseAiModelsResult } from './hooks/useAiModels';

export { useAiServerConfig } from './hooks/useAiServerConfig';

export { fetchAiModels } from './services/fetchModels';

export {
  AiApiSettingsProvider,
  useAiApiSettings,
} from './context/AiApiSettingsContext';

export { default as AiApiSettingsPanel } from './components/AiApiSettingsPanel';

export { default as AiApiConnectivityTest } from './components/AiApiConnectivityTest';

export type { AiModelsListRequest, AiModelsListResponse } from './types/models';

export {
  CORE_CONNECTIVITY_TEST_TASK_ID,
  CORE_STRUCTURED_MULTIMODAL_TASK_ID,
  CORE_LLM_COMPLETION_TASK_ID,
} from 'sa2kit/common/aiApi';

export { fileToAiImageInput, callMultimodalChat } from 'sa2kit/common/aiApi';

export type { AiApiSettings, AiClientSettings } from './utils/aiSettingsCore';

export {
  DEFAULT_AI_API_SETTINGS,
  AI_API_SETTINGS_STORAGE_KEY,
  loadAiApiSettings,
  saveAiApiSettings,
  pickClientSettingsFromStorage,
} from './utils/aiSettingsCore';

export { toServerClientSettings } from './utils/toServerClientSettings';

export const AI_API_MODULE_VERSION = '2.0.0';

/** 内置通用任务 ID（SSOT: sa2kit/common/aiApi） */
export const AI_TASK_IDS = {
  llmCompletion: 'core.llmCompletion',
  structuredMultimodal: 'core.structuredMultimodal',
  connectivityTest: 'core.connectivityTest',
} as const;
