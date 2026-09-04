import {
  createGenerateLessonHandler,
  createListGenerateJobsHandler,
} from 'sa2kit/business/teachHub/routes';
import { createTeachHubHostRouteConfig } from '../../../hostRouteConfig';

const config = createTeachHubHostRouteConfig();

export const POST = createGenerateLessonHandler(config);
export const GET = createListGenerateJobsHandler(config);
