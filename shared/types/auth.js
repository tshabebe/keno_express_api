"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthResponseSchema = exports.UserPublicSchema = exports.LoginWithPhoneSchema = exports.PasswordSchema = exports.PhoneNumberSchema = void 0;
const zod_1 = require("zod");
// Common primitives
exports.PhoneNumberSchema = zod_1.z
    .string()
    .trim()
    // E.164-like, allow leading + and 7-15 digits total
    .regex(/^\+?[1-9]\d{6,14}$/, 'Enter a valid phone number');
exports.PasswordSchema = zod_1.z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password is too long');
// Request schemas
exports.LoginWithPhoneSchema = zod_1.z.object({
    phone_number: exports.PhoneNumberSchema,
    password: exports.PasswordSchema,
});
// Response schemas
exports.UserPublicSchema = zod_1.z.object({
    id: zod_1.z.string(),
    email: zod_1.z.string().email().optional(),
    phone_number: exports.PhoneNumberSchema.optional(),
    displayName: zod_1.z.string(),
    balance: zod_1.z.number().default(0),
});
exports.AuthResponseSchema = zod_1.z.object({
    token: zod_1.z.string(),
    user: exports.UserPublicSchema,
});
