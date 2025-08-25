import mongoose, { Schema, type Model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const DrawningSchema = new Schema({
  round_id: { type: String, required: true, index: true },
  drawn_number: { type: [Number], required: true },
  created_at: { type: Date, default: () => new Date() }
});

export type Drawning = InferSchemaType<typeof DrawningSchema>;
export type DrawningDoc = HydratedDocument<Drawning>;
export type DrawningModel = Model<Drawning>;

export const Drawning: DrawningModel = (mongoose.models.Drawning as DrawningModel) || mongoose.model<Drawning>('Drawning', DrawningSchema, 'drawnings');

export default Drawning;

