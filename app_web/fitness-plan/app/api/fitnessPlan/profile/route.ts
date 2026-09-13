import {
  createGetProfileHandler,
  createPutProfileHandler,
} from 'sa2kit/business/fitnessPlan/routes';
import { createFitnessPlanHostRouteConfig } from '../../../../lib/hostRouteConfig';

const config = createFitnessPlanHostRouteConfig();
export const GET = createGetProfileHandler(config);
export const PUT = createPutProfileHandler(config);
