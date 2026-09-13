import {
  createGetSessionsByIdHandler,
  createPutSessionsByIdHandler,
} from 'sa2kit/business/fitnessPlan/routes';
import { createFitnessPlanHostRouteConfig } from '../../../../../lib/hostRouteConfig';

const config = createFitnessPlanHostRouteConfig();
export const GET = createGetSessionsByIdHandler(config);
export const PUT = createPutSessionsByIdHandler(config);
