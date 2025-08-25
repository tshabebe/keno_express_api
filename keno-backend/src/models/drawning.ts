import mongoose, { Schema, Document, Model } from 'mongoose';

export interface DrawningDocument extends Document {
  round_id: string;
  drawn_number: number[];
  created_at: Date;
}

const DrawningSchema = new Schema<DrawningDocument>({
  round_id: { type: String, required: true, index: true },
  drawn_number: { type: [Number], required: true },
  created_at: { type: Date, default: () => new Date() }
});

export const Drawning: Model<DrawningDocument> = mongoose.models.Drawning || mongoose.model<DrawningDocument>('Drawning', DrawningSchema, 'drawnings');

export default Drawning;

