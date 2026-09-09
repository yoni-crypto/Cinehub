import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL || '';

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI or MONGODB_URL environment variable inside .env'
  );
}

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalWithMongo = global as unknown as { _mongooseCached?: Cached };

const cached: Cached = globalWithMongo._mongooseCached ?? {
  conn: null,
  promise: null,
};
globalWithMongo._mongooseCached = cached;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export async function disconnectFromDatabase(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}

export function isMongoDBConfigured(): boolean {
  return !!MONGODB_URI;
}
