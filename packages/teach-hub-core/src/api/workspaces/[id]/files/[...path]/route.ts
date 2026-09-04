import {
  createReadFileHandler,
  createWriteFileHandler,
} from 'sa2kit/business/teachHub/routes';
import { createTeachHubHostRouteConfig } from '../../../../hostRouteConfig';

const config = createTeachHubHostRouteConfig();

export const GET = createReadFileHandler(config);
export const PUT = createWriteFileHandler(config);
