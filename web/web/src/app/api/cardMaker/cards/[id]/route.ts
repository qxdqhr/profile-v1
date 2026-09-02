import { NextRequest, NextResponse } from 'next/server';
import { getApiSessionUser } from '@/lib/auth/session';
import { CardMakerDbService } from '@/modules/cardMaker/db/cardMakerDbService';

async function requireOwnedCard(request: NextRequest, id: string) {
  const user = await getApiSessionUser(request);
  if (!user) {
    return { error: NextResponse.json({ error: '未授权的访问' }, { status: 401 }) };
  }

  const card = await CardMakerDbService.getCardById(id);
  if (!card) {
    return { error: NextResponse.json({ error: 'Card not found' }, { status: 404 }) };
  }

  if (card.userId && card.userId !== String(user.id)) {
    return { error: NextResponse.json({ error: '无权操作该名片' }, { status: 403 }) };
  }

  return { user, card };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const owned = await requireOwnedCard(request, id);
    if (owned.error) return owned.error;

    return NextResponse.json(owned.card);
  } catch (error) {
    console.error('Error fetching card:', error);
    return NextResponse.json(
      { error: 'Failed to fetch card' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const owned = await requireOwnedCard(request, id);
    if (owned.error) return owned.error;

    const updates = await request.json();
    delete updates.userId;
    delete updates.id;

    const updatedCard = await CardMakerDbService.updateCard(id, updates);

    if (!updatedCard) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error('Error updating card:', error);
    return NextResponse.json(
      { error: 'Failed to update card' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const owned = await requireOwnedCard(request, id);
    if (owned.error) return owned.error;

    const success = await CardMakerDbService.deleteCard(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Error deleting card:', error);
    return NextResponse.json(
      { error: 'Failed to delete card' },
      { status: 500 },
    );
  }
}
