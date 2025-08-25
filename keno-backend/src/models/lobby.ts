import mongoose, { Schema, type Model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const LobbySchema = new Schema({
  name: { type: String, required: true },
  max_players: { type: Number, required: true, default: 10 },
  players: { type: [String], required: true, default: [] },
  round_id: { type: String, required: false },
  created_at: { type: Date, default: () => new Date() },
  owner_id: { type: String, required: true }
});

export type Lobby = InferSchemaType<typeof LobbySchema>;
export type LobbyDoc = HydratedDocument<Lobby>;
export type LobbyModel = Model<Lobby>;

export const Lobby: LobbyModel = (mongoose.models.Lobby as LobbyModel) || mongoose.model<Lobby>('Lobby', LobbySchema, 'lobbies');

export default Lobby;

