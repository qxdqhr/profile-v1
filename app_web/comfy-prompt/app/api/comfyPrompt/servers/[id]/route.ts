import {
  createPutServersByIdHandler,
  createDeleteServersByIdHandler,
} from 'sa2kit/business/comfyPrompt/routes';
import { createComfyPromptHostRouteConfig } from '../../../../../lib/hostRouteConfig';

const config = createComfyPromptHostRouteConfig();
export const PUT = createPutServersByIdHandler(config);
export const DELETE = createDeleteServersByIdHandler(config);
