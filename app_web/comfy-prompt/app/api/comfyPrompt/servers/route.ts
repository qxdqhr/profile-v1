import {
  createGetServersHandler,
  createPostServersHandler,
} from 'sa2kit/business/comfyPrompt/routes';
import { createComfyPromptHostRouteConfig } from '../../../../lib/hostRouteConfig';

const config = createComfyPromptHostRouteConfig();
export const GET = createGetServersHandler(config);
export const POST = createPostServersHandler(config);
