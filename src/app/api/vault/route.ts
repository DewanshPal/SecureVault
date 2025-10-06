import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { VaultItem } from '@/model/vault.model';
import { getAuthenticatedUser } from '@/lib/middleware';

// GET all vault items for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const vaultItems = await VaultItem.find({ userId: user.userId })
      .sort({ updatedAt: -1 });

    return NextResponse.json({ vaultItems });

  } catch (error) {
    console.error('Get vault items error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create a new vault item
export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, username, password, url, notes, tags } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const vaultItem = new VaultItem({
      userId: user.userId,
      title,
      username,
      password,
      url,
      notes,
      tags: tags || []
    });

    await vaultItem.save();

    return NextResponse.json({
      message: 'Vault item created successfully',
      vaultItem
    }, { status: 201 });

  } catch (error) {
    console.error('Create vault item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
