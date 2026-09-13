import {
  createPutGroupsByIdHandler,
  createDeleteGroupsByIdHandler,
} from 'sa2kit/business/comfyPrompt/routes';
import { createComfyPromptHostRouteConfig } from '../../../../../lib/hostRouteConfig';

const config = createComfyPromptHostRouteConfig();
export const PUT = createPutGroupsByIdHandler(config);
export const DELETE = createDeleteGroupsByIdHandler(config);
