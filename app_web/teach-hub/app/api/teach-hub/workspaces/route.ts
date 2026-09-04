import {
  createListWorkspacesHandler,
  createCreateWorkspaceHandler,
} from 'sa2kit/business/teachHub/routes';
import { createTeachHubHostRouteConfig } from '@lib/hostRouteConfig';

const config = createTeachHubHostRouteConfig();

export const GET = createListWorkspacesHandler(config);
export const POST = createCreateWorkspaceHandler(config);
