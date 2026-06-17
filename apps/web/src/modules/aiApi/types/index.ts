export type {
  AiApiRunRequest,
  AiApiResponse,
  AiApiErrorBody,
  AiApiErrorCode,
  AiApiResponseMeta,
  AiImageInput,
  AiMediaInput,
  AiMediaKind,
  AudioStrategy,
  StructuredMultimodalInput,
  StructuredMultimodalOutput,
  AiTaskDefinition,
  AiTaskRunOptions,
  AiClientSettings,
  TextCompletionInput,
  TextCompletionOutput,
  ConnectivityTestOutput,
  AiServerConfigStatus,
  AiModelsListRequest,
  AiModelsListResponse,
  CORE_LLM_COMPLETION_TASK_ID,
  CORE_STRUCTURED_MULTIMODAL_TASK_ID,
  CORE_CONNECTIVITY_TEST_TASK_ID,
} from 'sa2kit/common/aiApi';

import type { AiClientSettings } from 'sa2kit/common/aiApi';

/** profile-v1 路由保证 userId 存在 */
export interface AiTaskContext {
  userId: number;
  requestId: string;
  clientSettings?: AiClientSettings;
}
