import {
  createGetPlansTemplatesHandler,
} from 'sa2kit/business/fitnessPlan/routes';
import { createFitnessPlanHostRouteConfig } from '../../../../../lib/hostRouteConfig';

const config = createFitnessPlanHostRouteConfig();
export const GET = createGetPlansTemplatesHandler(config);
