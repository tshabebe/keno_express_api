import { z } from 'zod'

export const KenoConfigSchema = z.object({
  // simple odds map: picksCount -> payout multiplier
  payouts: z.record(z.string(), z.number().nonnegative()).default({})
})

export type KenoConfig = z.infer<typeof KenoConfigSchema>


