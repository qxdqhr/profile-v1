import {
  createDeleteFestivalCardHandler,
  createGetFestivalCardHandler,
  createUpsertFestivalCardHandler,
} from 'sa2kit/festivalCard/routes';
import { db } from '@/db';

const config = { db };

export const GET = createGetFestivalCardHandler(config);
export const PUT = createUpsertFestivalCardHandler(config);
export const DELETE = createDeleteFestivalCardHandler(config);
