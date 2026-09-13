import {
  createDeleteJobsByIdOutputsHandler,
} from 'sa2kit/business/comfyPrompt/routes';
import { createComfyPromptHostRouteConfig } from '../../../../../../lib/hostRouteConfig';

const config = createComfyPromptHostRouteConfig();
export const DELETE = createDeleteJobsByIdOutputsHandler(config);
