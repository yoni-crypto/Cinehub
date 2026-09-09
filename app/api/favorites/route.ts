import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectToDatabase } from '@/lib/mongodb';
import { Favorite, MediaEntryType } from '@/lib/models/FavoriteWatchlist';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectToDatabase();

    const items = await Favorite.find({
      user: new mongoose.Types.ObjectId(session.user.id),
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      items.map((item) => ({
        id: item._id.toString(),
        user_id: session.user.id,
        movie_id: item.mediaId,
        media_type: item.mediaType,
        movie_title: item.title,
        movie_poster: item.poster,
        added_at: item.createdAt,
      }))
    );
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const mediaId = Number(body.mediaId ?? body.movie_id);
    const mediaType = body.mediaType ?? 'movie';
    const title = body.title ?? body.movie_title;
    const poster = body.poster ?? body.movie_poster;

    if (!mediaId || !title) {
      return NextResponse.json(
        { error: 'mediaId and title are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const userId = new mongoose.Types.ObjectId(session.user.id);

    const existing = await Favorite.findOne({ user: userId, mediaId, mediaType });

    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      return NextResponse.json({ inFavorites: false });
    }

    await Favorite.create({
      user: userId,
      mediaId,
      mediaType,
      title,
      poster,
      createdAt: new Date(),
    });

    return NextResponse.json({ inFavorites: true });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const mediaId = Number(searchParams.get('mediaId') || searchParams.get('movie_id'));
    const mediaType = (searchParams.get('mediaType') || 'movie') as MediaEntryType;

    if (!mediaId) {
      return NextResponse.json({ error: 'mediaId is required' }, { status: 400 });
    }

    await connectToDatabase();

    await Favorite.deleteOne({
      user: new mongoose.Types.ObjectId(session.user.id),
      mediaId,
      mediaType,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
