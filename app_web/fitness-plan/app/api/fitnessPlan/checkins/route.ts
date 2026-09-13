import {
  createPostCheckinsHandler,
  createDeleteCheckinsHandler,
} from 'sa2kit/business/fitnessPlan/routes';
import { createFitnessPlanHostRouteConfig } from '../../../../lib/hostRouteConfig';

const config = createFitnessPlanHostRouteConfig();
export const POST = createPostCheckinsHandler(config);
export const DELETE = createDeleteCheckinsHandler(config);
