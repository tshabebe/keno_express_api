import { z } from 'zod';

export const roundIdParamSchema = z.object({ round_id: z.string().min(1) });
export const roundCreateQuerySchema = z.object({ starts_at: z.string().min(1) });

