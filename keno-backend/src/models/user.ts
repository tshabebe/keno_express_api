import mongoose, { Schema, type Model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  password_hash: { type: String, required: true },
  display_name: { type: String, required: true },
  wallet_balance: { type: Number, required: true, default: 1000 },
  created_at: { type: Date, default: () => new Date() }
});

export type User = InferSchemaType<typeof UserSchema>;
export type UserDoc = HydratedDocument<User>;
export type UserModel = Model<User>;

export const User: UserModel = (mongoose.models.User as UserModel) || mongoose.model<User>('User', UserSchema, 'users');

export default User;

