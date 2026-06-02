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
} from './types';

export {
  aiApiClient,
  runAiTask,
  runAiTaskOrThrow,
  createAiTaskRunner,
  AiApiClientError,
} from './services/aiApiClient';

export { useAiTask } from './hooks/useAiTask';

export {
  AiApiSettingsProvider,
  useAiApiSettings,
} from './context/AiApiSettingsContext';

export { default as AiApiSettingsPanel } from './components/AiApiSettingsPanel';

export { default as AiApiConnectivityTest } from './components/AiApiConnectivityTest';

export type { ConnectivityTestOutput } from './types/connectivityTest';

export { CORE_CONNECTIVITY_TEST_TASK_ID } from './types/connectivityTest';

export type { AiApiSettings, AiClientSettings } from './utils/aiSettingsCore';

export {
  DEFAULT_AI_API_SETTINGS,
  AI_API_SETTINGS_STORAGE_KEY,
  loadAiApiSettings,
  saveAiApiSettings,
  pickClientSettingsFromStorage,
} from './utils/aiSettingsCore';

export const AI_API_MODULE_VERSION = '1.0.0';

/** 内置通用任务 ID */
export const AI_TASK_IDS = {
  structuredMultimodal: 'core.structuredMultimodal',
  connectivityTest: 'core.connectivityTest',
} as const;
