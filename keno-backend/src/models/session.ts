import mongoose, { Schema, type Model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const SessionSchema = new Schema({
  status: { type: String, enum: ['idle', 'select', 'draw'], required: true, default: 'idle' },
  current_round_id: { type: String, required: false },
  phase_ends_at: { type: Date, required: false },
  draw_progress_seq: { type: Number, required: false, default: -1 },
  updated_at: { type: Date, default: () => new Date() },
});

export type Session = InferSchemaType<typeof SessionSchema>;
export type SessionDoc = HydratedDocument<Session>;
export type SessionModel = Model<Session>;

export const Session: SessionModel = (mongoose.models.Session as SessionModel) || mongoose.model<Session>('Session', SessionSchema, 'sessions');

export default Session;


