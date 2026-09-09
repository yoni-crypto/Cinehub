import mongoose, { Schema, Document, models } from 'mongoose';

export type MediaEntryType = 'movie' | 'tv';

export interface MediaEntryDocument extends Document {
  user: mongoose.Types.ObjectId;
  mediaId: number;
  mediaType: MediaEntryType;
  title: string;
  poster: string;
  createdAt: Date;
}

const mediaEntrySchemaDef = (): Record<string, any> => ({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  mediaId: { type: Number, required: true },
  mediaType: { type: String, enum: ['movie', 'tv'], required: true },
  title: { type: String, required: true },
  poster: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const FavoriteSchema = new Schema<MediaEntryDocument>(mediaEntrySchemaDef());
const WatchlistSchema = new Schema<MediaEntryDocument>(mediaEntrySchemaDef());

FavoriteSchema.index({ user: 1, mediaId: 1, mediaType: 1 }, { unique: true });
WatchlistSchema.index({ user: 1, mediaId: 1, mediaType: 1 }, { unique: true });

export const Favorite =
  (models.Favorite as mongoose.Model<MediaEntryDocument>) ||
  mongoose.model<MediaEntryDocument>('Favorite', FavoriteSchema);

export const Watchlist =
  (models.Watchlist as mongoose.Model<MediaEntryDocument>) ||
  mongoose.model<MediaEntryDocument>('Watchlist', WatchlistSchema);
