import { z } from "zod";

// Request Schemas
export const StartLoginRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const VerifyLoginRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().min(1, "OTP is required"),
});

export const RefreshTokenRequestSchema = z.object({
  refresh_token: z.string().min(1, "Refresh token is required"),
});

export type StartLoginRequestFields = z.infer<typeof StartLoginRequestSchema>;
export type VerifyLoginRequestFields = z.infer<typeof VerifyLoginRequestSchema>;
export type RefreshTokenRequestFields = z.infer<
  typeof RefreshTokenRequestSchema
>;

export type StartLoginResponseFields = Record<string, never>;

export interface VerifyLoginResponseFields {
  access_token: string;
  refresh_token: string;
  user_id: string;
}

export interface RefreshTokenResponseFields {
  access_token: string;
  refresh_token: string;
}

export interface RefreshLoginRequestFields {
  refresh_token: string;
}

export interface RefreshLoginResponseFields {
  access_token: string;
  refresh_token: string;
  user_id: string;
}
