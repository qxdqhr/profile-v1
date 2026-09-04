import {
  createListProgressHandler,
  createUpsertProgressHandler,
} from 'sa2kit/business/teachHub/routes';
import { createTeachHubHostRouteConfig } from '@lib/hostRouteConfig';

const config = createTeachHubHostRouteConfig();

export const GET = createListProgressHandler(config);
export const POST = createUpsertProgressHandler(config);
