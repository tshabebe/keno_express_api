import mongoose, { Schema, type Model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const RoundSchema = new Schema({
  starts_at: { type: Date, required: true },
  ends_at: { type: Date, required: true },
  created_at: { type: Date, default: () => new Date() }
});

export type Round = InferSchemaType<typeof RoundSchema>;
export type RoundDoc = HydratedDocument<Round>;
export type RoundModel = Model<Round>;

export const Round: RoundModel = (mongoose.models.Round as RoundModel) || mongoose.model<Round>('Round', RoundSchema, 'rounds');

export default Round;

