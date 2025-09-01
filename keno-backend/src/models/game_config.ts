import mongoose, { Schema, type Model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const GameConfigSchema = new Schema({
  game: { type: String, required: true },
  version: { type: Number, required: true, default: 1 },
  data: { type: Schema.Types.Mixed, required: true },
  updated_by: { type: Schema.Types.ObjectId, ref: 'User' },
  updated_at: { type: Date, default: () => new Date() },
});

GameConfigSchema.index({ game: 1 }, { unique: true });

export type GameConfig = InferSchemaType<typeof GameConfigSchema>;
export type GameConfigDoc = HydratedDocument<GameConfig>;
export type GameConfigModel = Model<GameConfig>;

export const GameConfig: GameConfigModel = (mongoose.models.GameConfig as GameConfigModel) || mongoose.model<GameConfig>('GameConfig', GameConfigSchema, 'game_configs');

export default GameConfig;


