import { createImportZipHandler } from 'sa2kit/business/teachHub/routes';
import { createTeachHubHostRouteConfig } from '@lib/hostRouteConfig';

const config = createTeachHubHostRouteConfig();

export const POST = createImportZipHandler(config);
