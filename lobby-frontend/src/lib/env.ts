import { z } from 'zod'

const EnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url().optional(),
  VITE_SOCKET_URL: z.string().url().optional()
})

export const env = (() => {
  const raw = import.meta.env as unknown as Record<string, unknown>
  const parsed = EnvSchema.safeParse(raw)
  return parsed.success ? parsed.data : {}
})()

export const getApiBaseUrl = () => env.VITE_API_BASE_URL || 'http://localhost:3000'
export const getSocketUrl = () => env.VITE_SOCKET_URL || env.VITE_API_BASE_URL || 'http://localhost:3000'


