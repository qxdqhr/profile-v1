import {
  createGetConfigHandler,
  createUpdateConfigHandler,
} from 'sa2kit/business/filetransfer/routes';
import { createFileTransferHostRouteConfig } from '../../../../lib/hostRouteConfig';

const config = createFileTransferHostRouteConfig();
export const GET = createGetConfigHandler(config);
export const PUT = createUpdateConfigHandler(config);
