import {
  createGetPlansHandler,
  createPostPlansHandler,
} from 'sa2kit/business/fitnessPlan/routes';
import { createFitnessPlanHostRouteConfig } from '../../../../lib/hostRouteConfig';

const config = createFitnessPlanHostRouteConfig();
export const GET = createGetPlansHandler(config);
export const POST = createPostPlansHandler(config);
