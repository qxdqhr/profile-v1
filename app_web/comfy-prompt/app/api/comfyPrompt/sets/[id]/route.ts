import {
  createGetSetsByIdHandler,
  createPutSetsByIdHandler,
  createDeleteSetsByIdHandler,
} from 'sa2kit/business/comfyPrompt/routes';
import { createComfyPromptHostRouteConfig } from '../../../../../lib/hostRouteConfig';

const config = createComfyPromptHostRouteConfig();
export const GET = createGetSetsByIdHandler(config);
export const PUT = createPutSetsByIdHandler(config);
export const DELETE = createDeleteSetsByIdHandler(config);
