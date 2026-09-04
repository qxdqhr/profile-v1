import {
  createGetWorkspaceHandler,
  createPatchWorkspaceHandler,
  createArchiveWorkspaceHandler,
} from 'sa2kit/business/teachHub/routes';
import { createTeachHubHostRouteConfig } from '@lib/hostRouteConfig';

const config = createTeachHubHostRouteConfig();

export const GET = createGetWorkspaceHandler(config);
export const PATCH = createPatchWorkspaceHandler(config);
export const DELETE = createArchiveWorkspaceHandler(config);
