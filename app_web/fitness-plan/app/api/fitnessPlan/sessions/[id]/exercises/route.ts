import {
  createPostSessionsByIdExercisesHandler,
} from 'sa2kit/business/fitnessPlan/routes';
import { createFitnessPlanHostRouteConfig } from '../../../../../../lib/hostRouteConfig';

const config = createFitnessPlanHostRouteConfig();
export const POST = createPostSessionsByIdExercisesHandler(config);
