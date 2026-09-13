import {
  createGetWorkflowsByIdHandler,
  createPutWorkflowsByIdHandler,
  createDeleteWorkflowsByIdHandler,
} from 'sa2kit/business/comfyPrompt/routes';
import { createComfyPromptHostRouteConfig } from '../../../../../lib/hostRouteConfig';

const config = createComfyPromptHostRouteConfig();
export const GET = createGetWorkflowsByIdHandler(config);
export const PUT = createPutWorkflowsByIdHandler(config);
export const DELETE = createDeleteWorkflowsByIdHandler(config);
