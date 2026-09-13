import {
  createGetJobsHandler,
  createPostJobsHandler,
} from 'sa2kit/business/comfyPrompt/routes';
import { createComfyPromptHostRouteConfig } from '../../../../lib/hostRouteConfig';

const config = createComfyPromptHostRouteConfig();
export const GET = createGetJobsHandler(config);
export const POST = createPostJobsHandler(config);
