import mongoose, { Schema, Document, Model } from 'mongoose';

export interface LobbyDocument extends Document {
  name: string;
  max_players: number;
  players: string[];
  created_at: Date;
  owner_id: string;
}

const LobbySchema = new Schema<LobbyDocument>({
  name: { type: String, required: true },
  max_players: { type: Number, required: true, default: 10 },
  players: { type: [String], required: true, default: [] },
  created_at: { type: Date, default: () => new Date() },
  owner_id: { type: String, required: true }
});

export const Lobby: Model<LobbyDocument> = mongoose.models.Lobby || mongoose.model<LobbyDocument>('Lobby', LobbySchema, 'lobbies');

export default Lobby;

