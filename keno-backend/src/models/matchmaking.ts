import mongoose, { Schema, Document, Model } from 'mongoose';

export interface MatchmakingQueueDocument extends Document {
  user_id: string;
  enqueued_at: Date;
}

const MatchmakingQueueSchema = new Schema<MatchmakingQueueDocument>({
  user_id: { type: String, required: true, unique: true, index: true },
  enqueued_at: { type: Date, default: () => new Date() }
});

export const MatchmakingQueue: Model<MatchmakingQueueDocument> = mongoose.models.MatchmakingQueue || mongoose.model<MatchmakingQueueDocument>('MatchmakingQueue', MatchmakingQueueSchema, 'matchmaking_queue');

export default MatchmakingQueue;

