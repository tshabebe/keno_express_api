import mongoose, { Schema, type Model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const TicketSchema = new Schema({
  round_id: { type: String, required: true, index: true },
  played_number: { type: [Number], required: true },
  created_at: { type: Date, default: () => new Date() }
});

export type Ticket = InferSchemaType<typeof TicketSchema>;
export type TicketDoc = HydratedDocument<Ticket>;
export type TicketModel = Model<Ticket>;

export const Ticket: TicketModel = (mongoose.models.Ticket as TicketModel) || mongoose.model<Ticket>('Ticket', TicketSchema, 'tickets');

export default Ticket;

