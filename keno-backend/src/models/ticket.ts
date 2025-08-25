import mongoose, { Schema, Document, Model } from 'mongoose';

export interface TicketDocument extends Document {
  round_id: string;
  played_number: number[];
  created_at: Date;
}

const TicketSchema = new Schema<TicketDocument>({
  round_id: { type: String, required: true, index: true },
  played_number: { type: [Number], required: true },
  created_at: { type: Date, default: () => new Date() }
});

export const Ticket: Model<TicketDocument> = mongoose.models.Ticket || mongoose.model<TicketDocument>('Ticket', TicketSchema, 'tickets');

export default Ticket;

