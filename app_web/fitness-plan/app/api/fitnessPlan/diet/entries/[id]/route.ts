import {
  createPutDietEntriesByIdHandler,
  createDeleteDietEntriesByIdHandler,
} from 'sa2kit/business/fitnessPlan/routes';
import { createFitnessPlanHostRouteConfig } from '../../../../../../lib/hostRouteConfig';

const config = createFitnessPlanHostRouteConfig();
export const PUT = createPutDietEntriesByIdHandler(config);
export const DELETE = createDeleteDietEntriesByIdHandler(config);
