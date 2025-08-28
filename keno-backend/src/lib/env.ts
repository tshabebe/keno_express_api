import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.string().regex(/^\d+$/).transform((v) => parseInt(v, 10)).optional(),
  SELECT_PHASE_SEC: z.string().regex(/^\d+$/).transform((v) => parseInt(v, 10)).optional(),
  DRAW_PHASE_SEC: z.string().regex(/^\d+$/).transform((v) => parseInt(v, 10)).optional(),
  JWT_SECRET: z.string().optional(),
  NEXT_GAMES_JWT_SECRET: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);
export const env = parsed.success
  ? parsed.data
  : ({} as z.infer<typeof EnvSchema>);

export const getNumberEnv = (value: number | undefined, fallback: number): number =>
  typeof value === 'number' && !Number.isNaN(value) ? value : fallback;

// no-op: wallet integration removed; keep placeholder for compatibility if imported elsewhere


