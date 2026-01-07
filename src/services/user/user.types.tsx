import { z } from "zod";

// Request Schemas
export const UpdateUserRequestSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  avatar_url: z.string().url("Must be a valid URL").optional(),
});

export type UpdateUserRequestFields = z.infer<typeof UpdateUserRequestSchema>;

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  last_login_at: string | null;
  inserted_at: string;
  updated_at: string;
}

// GET /api/users/me - Response
export interface GetCurrentUserResponseFields {
  data: User;
}

// PATCH /api/users/me - Response
export interface UpdateUserResponseFields {
  data: User;
}
