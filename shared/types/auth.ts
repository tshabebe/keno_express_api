import { z } from 'zod';

// Common primitives
export const PhoneNumberSchema = z
  .string()
  .trim()
  // E.164-like, allow leading + and 7-15 digits total
  .regex(/^\+?[1-9]\d{6,14}$/, 'Enter a valid phone number');

export const PasswordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(128, 'Password is too long');

// Request schemas
export const LoginWithPhoneSchema = z.object({
  phone_number: PhoneNumberSchema,
  password: PasswordSchema,
});

// Response schemas
export const UserPublicSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  phone_number: PhoneNumberSchema.optional(),
  displayName: z.string(),
  balance: z.number().default(0),
});

export const AuthResponseSchema = z.object({
  token: z.string(),
  user: UserPublicSchema,
});

export type LoginWithPhoneInput = z.infer<typeof LoginWithPhoneSchema>;
export type UserPublic = z.infer<typeof UserPublicSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

