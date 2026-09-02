import { NextRequest, NextResponse } from 'next/server';
import { getApiSessionUser } from '@/lib/auth/session';
import { CardMakerDbService } from '@/modules/cardMaker/db/cardMakerDbService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getApiSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const effectiveUserId = userId || String(user.id);

    if (effectiveUserId !== String(user.id)) {
      return NextResponse.json({ error: '无权查看其他用户的名片' }, { status: 403 });
    }

    const cards = await CardMakerDbService.getCardsByUserId(effectiveUserId);
    return NextResponse.json(cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    const cardData = await request.json();

    if (!cardData.characterName) {
      return NextResponse.json(
        { error: 'Character name is required' },
        { status: 400 },
      );
    }

    const newCard = await CardMakerDbService.createCard({
      ...cardData,
      userId: String(user.id),
    });
    return NextResponse.json(newCard, { status: 201 });
  } catch (error) {
    console.error('Error creating card:', error);
    return NextResponse.json(
      { error: 'Failed to create card' },
      { status: 500 },
    );
  }
}
