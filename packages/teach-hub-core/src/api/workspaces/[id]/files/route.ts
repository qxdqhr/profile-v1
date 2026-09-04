import { createListFilesHandler } from 'sa2kit/business/teachHub/routes';
import { createTeachHubHostRouteConfig } from '../../../hostRouteConfig';

const config = createTeachHubHostRouteConfig();

export const GET = createListFilesHandler(config);
