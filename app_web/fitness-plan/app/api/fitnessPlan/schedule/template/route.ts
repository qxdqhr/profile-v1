import {
  createGetScheduleTemplateHandler,
  createPutScheduleTemplateHandler,
} from 'sa2kit/business/fitnessPlan/routes';
import { createFitnessPlanHostRouteConfig } from '../../../../../lib/hostRouteConfig';

const config = createFitnessPlanHostRouteConfig();
export const GET = createGetScheduleTemplateHandler(config);
export const PUT = createPutScheduleTemplateHandler(config);
