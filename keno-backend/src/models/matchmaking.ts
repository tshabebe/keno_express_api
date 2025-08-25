import mongoose, { Schema, type Model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const MatchmakingQueueSchema = new Schema({
  user_id: { type: String, required: true, unique: true, index: true },
  enqueued_at: { type: Date, default: () => new Date() }
});

export type MatchmakingQueue = InferSchemaType<typeof MatchmakingQueueSchema>;
export type MatchmakingQueueDoc = HydratedDocument<MatchmakingQueue>;
export type MatchmakingQueueModel = Model<MatchmakingQueue>;

export const MatchmakingQueue: MatchmakingQueueModel = (mongoose.models.MatchmakingQueue as MatchmakingQueueModel) || mongoose.model<MatchmakingQueue>('MatchmakingQueue', MatchmakingQueueSchema, 'matchmaking_queue');

export default MatchmakingQueue;

