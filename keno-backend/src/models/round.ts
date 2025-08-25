import mongoose, { Schema, Document, Model } from 'mongoose';

export interface RoundDocument extends Document {
  starts_at: Date;
  ends_at: Date;
  created_at: Date;
}

const RoundSchema = new Schema<RoundDocument>({
  starts_at: { type: Date, required: true },
  ends_at: { type: Date, required: true },
  created_at: { type: Date, default: () => new Date() }
});

export const Round: Model<RoundDocument> = mongoose.models.Round || mongoose.model<RoundDocument>('Round', RoundSchema, 'rounds');

export default Round;

