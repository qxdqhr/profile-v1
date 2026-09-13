import {
  createGetExercisesHandler,
  createPostExercisesHandler,
} from 'sa2kit/business/fitnessPlan/routes';
import { createFitnessPlanHostRouteConfig } from '../../../../lib/hostRouteConfig';

const config = createFitnessPlanHostRouteConfig();
export const GET = createGetExercisesHandler(config);
export const POST = createPostExercisesHandler(config);
