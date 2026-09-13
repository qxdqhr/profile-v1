import {
  createGetGroupsHandler,
  createPostGroupsHandler,
} from 'sa2kit/business/comfyPrompt/routes';
import { createComfyPromptHostRouteConfig } from '../../../../lib/hostRouteConfig';

const config = createComfyPromptHostRouteConfig();
export const GET = createGetGroupsHandler(config);
export const POST = createPostGroupsHandler(config);
