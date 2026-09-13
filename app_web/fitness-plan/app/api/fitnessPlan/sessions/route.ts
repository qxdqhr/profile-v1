import {
  createGetSessionsHandler,
  createPostSessionsHandler,
} from 'sa2kit/business/fitnessPlan/routes';
import { createFitnessPlanHostRouteConfig } from '../../../../lib/hostRouteConfig';

const config = createFitnessPlanHostRouteConfig();
export const GET = createGetSessionsHandler(config);
export const POST = createPostSessionsHandler(config);
