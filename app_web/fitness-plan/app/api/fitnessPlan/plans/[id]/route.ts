import {
  createGetPlansByIdHandler,
  createPutPlansByIdHandler,
  createDeletePlansByIdHandler,
} from 'sa2kit/business/fitnessPlan/routes';
import { createFitnessPlanHostRouteConfig } from '../../../../../lib/hostRouteConfig';

const config = createFitnessPlanHostRouteConfig();
export const GET = createGetPlansByIdHandler(config);
export const PUT = createPutPlansByIdHandler(config);
export const DELETE = createDeletePlansByIdHandler(config);
