import {
  createPutPromptsByIdHandler,
  createDeletePromptsByIdHandler,
} from 'sa2kit/business/comfyPrompt/routes';
import { createComfyPromptHostRouteConfig } from '../../../../../lib/hostRouteConfig';

const config = createComfyPromptHostRouteConfig();
export const PUT = createPutPromptsByIdHandler(config);
export const DELETE = createDeletePromptsByIdHandler(config);
