import { createImportZipHandler } from 'sa2kit/business/teachHub/routes';
import { createTeachHubHostRouteConfig } from '../../../hostRouteConfig';

const config = createTeachHubHostRouteConfig();

export const POST = createImportZipHandler(config);
