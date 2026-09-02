import { createListFestivalCardsHandler } from 'sa2kit/business/festivalCard/routes';
import { db } from '@/db';

export const GET = createListFestivalCardsHandler({ db });
