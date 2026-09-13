import {
  createGetWorkflowsHandler,
  createPostWorkflowsHandler,
} from 'sa2kit/business/comfyPrompt/routes';
import { createComfyPromptHostRouteConfig } from '../../../../lib/hostRouteConfig';

const config = createComfyPromptHostRouteConfig();
export const GET = createGetWorkflowsHandler(config);
export const POST = createPostWorkflowsHandler(config);
