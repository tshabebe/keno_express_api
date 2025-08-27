import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.string().regex(/^\d+$/).transform((v) => parseInt(v, 10)).optional(),
  SELECT_PHASE_SEC: z.string().regex(/^\d+$/).transform((v) => parseInt(v, 10)).optional(),
  DRAW_PHASE_SEC: z.string().regex(/^\d+$/).transform((v) => parseInt(v, 10)).optional(),
  WALLET_URL: z.string().url().optional(),
  walletUrl: z.string().url().optional(),
  SHARED_SECRET_BINGO: z.string().optional(),
  PASS_KEY: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  NEXT_GAMES_JWT_SECRET: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);
export const env = parsed.success
  ? parsed.data
  : ({} as z.infer<typeof EnvSchema>);

export const getNumberEnv = (value: number | undefined, fallback: number): number =>
  typeof value === 'number' && !Number.isNaN(value) ? value : fallback;

export const getWalletUrl = (): string => env.WALLET_URL || env.walletUrl || '';

