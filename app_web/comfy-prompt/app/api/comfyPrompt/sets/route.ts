import {
  createGetSetsHandler,
  createPostSetsHandler,
} from 'sa2kit/business/comfyPrompt/routes';
import { createComfyPromptHostRouteConfig } from '../../../../lib/hostRouteConfig';

const config = createComfyPromptHostRouteConfig();
export const GET = createGetSetsHandler(config);
export const POST = createPostSetsHandler(config);
