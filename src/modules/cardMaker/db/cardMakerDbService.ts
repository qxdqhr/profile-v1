import { db } from '@/db';
import { cards, cardAssets, Card, NewCard, CardAsset, NewCardAsset } from './schema';
import { eq, and, desc } from 'drizzle-orm';

export class CardMakerDbService {
  // 名片相关操作
  static async createCard(cardData: NewCard): Promise<Card> {
    const [newCard] = await db.insert(cards).values({
      ...cardData,
      updatedAt: new Date(),
    }).returning();
    return newCard;
  }

  static async getCardById(id: string): Promise<Card | null> {
    const [card] = await db.select().from(cards).where(eq(cards.id, id));
    return card || null;
  }

  static async getCardsByUserId(userId: string): Promise<Card[]> {
    return await db.select().from(cards)
      .where(eq(cards.userId, userId))
      .orderBy(desc(cards.updatedAt));
  }

  static async getAllCards(): Promise<Card[]> {
    return await db.select().from(cards)
      .orderBy(desc(cards.updatedAt));
  }

  static async updateCard(id: string, updates: Partial<NewCard>): Promise<Card | null> {
    const [updatedCard] = await db.update(cards)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(cards.id, id))
      .returning();
    return updatedCard || null;
  }

  static async deleteCard(id: string): Promise<boolean> {
    const result = await db.delete(cards).where(eq(cards.id, id));
    return result.length > 0;
  }

  // 资源相关操作
  static async createAsset(assetData: NewCardAsset): Promise<CardAsset> {
    const [newAsset] = await db.insert(cardAssets).values(assetData).returning();
    return newAsset;
  }

  static async getAssetById(id: string): Promise<CardAsset | null> {
    const [asset] = await db.select().from(cardAssets).where(eq(cardAssets.id, id));
    return asset || null;
  }

  static async getAssetsByType(type: string): Promise<CardAsset[]> {
    return await db.select().from(cardAssets)
      .where(eq(cardAssets.type, type))
      .orderBy(desc(cardAssets.createdAt));
  }

  static async getAssetsByCategory(category: string): Promise<CardAsset[]> {
    return await db.select().from(cardAssets)
      .where(eq(cardAssets.category, category))
      .orderBy(desc(cardAssets.createdAt));
  }

  static async getAssetsByTypeAndCategory(type: string, category: string): Promise<CardAsset[]> {
    return await db.select().from(cardAssets)
      .where(and(
        eq(cardAssets.type, type),
        eq(cardAssets.category, category)
      ))
      .orderBy(desc(cardAssets.createdAt));
  }

  static async getAllAssets(): Promise<CardAsset[]> {
    return await db.select().from(cardAssets)
      .orderBy(desc(cardAssets.createdAt));
  }

  static async deleteAsset(id: string): Promise<boolean> {
    const result = await db.delete(cardAssets).where(eq(cardAssets.id, id));
    return result.length > 0;
  }

  static async getDistinctCategories(): Promise<string[]> {
    const result = await db.selectDistinct({
      category: cardAssets.category
    }).from(cardAssets);
    return result.map(row => row.category);
  }

  static async getDistinctTypes(): Promise<string[]> {
    const result = await db.selectDistinct({
      type: cardAssets.type
    }).from(cardAssets);
    return result.map(row => row.type);
  }
}