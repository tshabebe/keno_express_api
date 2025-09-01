import { z } from 'zod'

export const RoundSchema = z.object({
  _id: z.string(),
  starts_at: z.union([z.string(), z.date()]).optional(),
  ends_at: z.union([z.string(), z.date()]).optional(),
})

export const TicketSchema = z.object({
  _id: z.string(),
  round_id: z.string(),
  played_number: z.array(z.number()),
  created_at: z.union([z.string(), z.date()]),
  bet_amount: z.number().optional(),
})

export const DrawSchema = z.object({
  round_id: z.string(),
  drawn_number: z.array(z.number()),
  created_at: z.union([z.string(), z.date()])
})

export const DrawCompletedSchema = z.object({
  current_timestamp: z.union([z.string(), z.date()]),
  drawn: DrawSchema,
  winnings: z.array(z.object({ played_number: z.array(z.number()) }))
})


