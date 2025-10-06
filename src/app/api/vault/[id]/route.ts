import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { VaultItem } from '@/model/vault.model';
import { getAuthenticatedUser } from '@/lib/middleware';

// GET a specific vault item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await dbConnect();

    const vaultItem = await VaultItem.findOne({
      _id: id,
      userId: user.userId
    });

    if (!vaultItem) {
      return NextResponse.json(
        { error: 'Vault item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(vaultItem);
  } catch (error) {
    console.error('Error fetching vault item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vault item' },
      { status: 500 }
    );
  }
}

// PUT update a vault item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { title, username, password, url, notes, tags } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const vaultItem = await VaultItem.findOneAndUpdate(
      {
        _id: id,
        userId: user.userId
      },
      {
        title,
        username: username || '',
        password: password || '',
        url: url || '',
        notes: notes || '',
        tags: tags || [],
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!vaultItem) {
      return NextResponse.json(
        { error: 'Vault item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Vault item updated successfully',
      vaultItem
    });
  } catch (error) {
    console.error('Error updating vault item:', error);
    return NextResponse.json(
      { error: 'Failed to update vault item' },
      { status: 500 }
    );
  }
}

// DELETE remove a vault item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await dbConnect();

    const vaultItem = await VaultItem.findOneAndDelete({
      _id: id,
      userId: user.userId
    });

    if (!vaultItem) {
      return NextResponse.json(
        { error: 'Vault item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Vault item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vault item:', error);
    return NextResponse.json(
      { error: 'Failed to delete vault item' },
      { status: 500 }
    );
  }
}
