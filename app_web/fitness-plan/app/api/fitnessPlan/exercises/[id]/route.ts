import {
  createPutExercisesByIdHandler,
  createDeleteExercisesByIdHandler,
} from 'sa2kit/business/fitnessPlan/routes';
import { createFitnessPlanHostRouteConfig } from '../../../../../lib/hostRouteConfig';

const config = createFitnessPlanHostRouteConfig();
export const PUT = createPutExercisesByIdHandler(config);
export const DELETE = createDeleteExercisesByIdHandler(config);
