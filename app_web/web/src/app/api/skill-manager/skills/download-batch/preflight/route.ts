import { createBatchDownloadPreflightHandler } from 'sa2kit/business/skillManager/routes';
import { createSkillManagerHostRouteConfig } from '@/lib/skillManager/hostRouteConfig';

const config = createSkillManagerHostRouteConfig();

export const POST = createBatchDownloadPreflightHandler(config);
