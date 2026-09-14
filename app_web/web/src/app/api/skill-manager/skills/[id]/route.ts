import {
  createGetSkillHandler,
  createUpdateSkillHandler,
} from 'sa2kit/business/skillManager/routes';
import { createSkillManagerHostRouteConfig } from '@/lib/skillManager/hostRouteConfig';

const config = createSkillManagerHostRouteConfig();

export const GET = createGetSkillHandler(config);
export const PUT = createUpdateSkillHandler(config);
