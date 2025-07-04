import { NextRequest, NextResponse } from 'next/server';
import { CardMakerDbService } from '@/modules/cardMaker/db/cardMakerDbService';

// 标记为动态路由，防止静态生成
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let cards;
    if (userId) {
      cards = await CardMakerDbService.getCardsByUserId(userId);
    } else {
      cards = await CardMakerDbService.getAllCards();
    }

    return NextResponse.json(cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cardData = await request.json();
    
    // 基础验证
    if (!cardData.characterName) {
      return NextResponse.json(
        { error: 'Character name is required' },
        { status: 400 }
      );
    }

    const newCard = await CardMakerDbService.createCard(cardData);
    return NextResponse.json(newCard, { status: 201 });
  } catch (error) {
    console.error('Error creating card:', error);
    return NextResponse.json(
      { error: 'Failed to create card' },
      { status: 500 }
    );
  }
}