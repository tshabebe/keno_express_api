import { z } from 'zod';

// Coerce any string/number to number and validate range 1..80
const numberParam = z.coerce.number().int().min(1).max(80);

export const ticketQuerySchema = z.object({
  round_id: z.string().min(1),
  number_one: numberParam.optional(),
  number_two: numberParam.optional(),
  number_three: numberParam.optional(),
  number_four: numberParam.optional(),
  number_five: numberParam.optional(),
  number_six: numberParam.optional(),
  number_seven: numberParam.optional(),
  number_eight: numberParam.optional(),
  number_nine: numberParam.optional(),
  number_ten: numberParam.optional(),
}).transform((q) => {
  const nums = [q.number_one, q.number_two, q.number_three, q.number_four, q.number_five, q.number_six, q.number_seven, q.number_eight, q.number_nine, q.number_ten]
    .filter((v): v is number => typeof v === 'number');
  const uniqueSorted = Array.from(new Set(nums)).sort((a, b) => a - b);
  return { round_id: q.round_id, played_number: uniqueSorted };
}).refine((v) => v.played_number.length >= 5, { message: 'at least 5 numbers required' });

export const ticketBodySchema = z.object({ bet_amount: z.coerce.number().gt(0) });

export type TicketCreateInput = z.infer<typeof ticketQuerySchema> & z.infer<typeof ticketBodySchema>;


