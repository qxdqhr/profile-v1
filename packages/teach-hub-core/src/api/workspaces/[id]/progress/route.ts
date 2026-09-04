import {
  createListProgressHandler,
  createUpsertProgressHandler,
} from 'sa2kit/business/teachHub/routes';
import { createTeachHubHostRouteConfig } from '../../../hostRouteConfig';

const config = createTeachHubHostRouteConfig();

export const GET = createListProgressHandler(config);
export const POST = createUpsertProgressHandler(config);
