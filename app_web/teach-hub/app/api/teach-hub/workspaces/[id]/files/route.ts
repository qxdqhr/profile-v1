import { createListFilesHandler } from 'sa2kit/business/teachHub/routes';
import { createTeachHubHostRouteConfig } from '@lib/hostRouteConfig';

const config = createTeachHubHostRouteConfig();

export const GET = createListFilesHandler(config);
