import mongoose, { Schema, Document, Model } from 'mongoose';

export interface UserDocument extends Document {
  email: string;
  password_hash: string;
  display_name: string;
  created_at: Date;
}

const UserSchema = new Schema<UserDocument>({
  email: { type: String, required: true, unique: true, index: true },
  password_hash: { type: String, required: true },
  display_name: { type: String, required: true },
  created_at: { type: Date, default: () => new Date() }
});

export const User: Model<UserDocument> = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema, 'users');

export default User;

