import {
  createGetPromptsHandler,
  createPostPromptsHandler,
} from 'sa2kit/business/comfyPrompt/routes';
import { createComfyPromptHostRouteConfig } from '../../../../lib/hostRouteConfig';

const config = createComfyPromptHostRouteConfig();
export const GET = createGetPromptsHandler(config);
export const POST = createPostPromptsHandler(config);
