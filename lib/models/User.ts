import mongoose, { Schema, Document, models } from 'mongoose';

export interface UserDocument extends Document {
  email: string;
  name?: string;
  image?: string;
  password?: string;
  provider: 'credentials' | 'google' | 'github';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String },
    image: { type: String },
    password: { type: String },
    provider: {
      type: String,
      enum: ['credentials', 'google', 'github'],
      default: 'credentials',
    },
  },
  { timestamps: true }
);

export const User =
  (models.User as mongoose.Model<UserDocument>) ||
  mongoose.model<UserDocument>('User', UserSchema);
