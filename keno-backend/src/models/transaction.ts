import mongoose, { Schema, type Model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const TransactionSchema = new Schema({
  tx_ref: { type: String, required: true, unique: true, index: true },
  user_id: { type: String, required: true, index: true },
  amount: { type: Number, required: false },
  currency: { type: String, required: false, default: 'ETB' },
  type: { type: String, enum: ['deposit', 'withdrawal'], required: true, default: 'deposit' },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], required: true, default: 'pending' },
  verified: { type: Boolean, default: false },
  created_at: { type: Date, default: () => new Date() },
  updated_at: { type: Date, default: () => new Date() },
});

export type Transaction = InferSchemaType<typeof TransactionSchema>;
export type TransactionDoc = HydratedDocument<Transaction>;
export type TransactionModel = Model<Transaction>;

export const Transaction: TransactionModel = (mongoose.models.Transaction as TransactionModel) || mongoose.model<Transaction>('Transaction', TransactionSchema, 'transactions');

export default Transaction;


