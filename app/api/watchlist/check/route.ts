import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectToDatabase } from '@/lib/mongodb';
import { Watchlist, MediaEntryType } from '@/lib/models/FavoriteWatchlist';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ inWatchlist: false });
    }

    const searchParams = request.nextUrl.searchParams;
    const mediaId = Number(searchParams.get('mediaId') || searchParams.get('movie_id'));
    const mediaType = (searchParams.get('mediaType') || 'movie') as MediaEntryType;

    if (!mediaId) {
      return NextResponse.json(
        { error: 'mediaId is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existing = await Watchlist.findOne({
      user: new mongoose.Types.ObjectId(session.user.id),
      mediaId,
      mediaType,
    }).select('_id');

    return NextResponse.json({ inWatchlist: !!existing });
  } catch (error) {
    console.error('Error checking watchlist item:', error);
    return NextResponse.json({ inWatchlist: false });
  }
}
