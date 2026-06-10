import { createListFestivalCardsHandler } from 'sa2kit/festivalCard/routes';
import { db } from '@/db';

export const GET = createListFestivalCardsHandler({ db });
