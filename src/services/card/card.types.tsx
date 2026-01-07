import { z } from "zod";

// Base Card interface
export interface Card {
  id: string;
  title: string;
  description: string | null;
  position: string;
  column_id: string;
  due_date: string | null;
  labels: string[] | null;
  checklist: string[] | null;
  attachments: string[] | null;
  inserted_at?: string;
  updated_at?: string;
}

// Request Schemas
export const CreateCardRequestSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  description: z
    .string()
    .max(5000, "Description is too long")
    .optional()
    .nullable(),
  position: z.string(),
  due_date: z.string().optional().nullable(),
  labels: z.array(z.string()).optional().nullable(),
  checklist: z.array(z.string()).optional().nullable(),
  attachments: z.array(z.string()).optional().nullable(),
});

export const UpdateCardRequestSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title is too long")
    .optional(),
  description: z
    .string()
    .max(5000, "Description is too long")
    .optional()
    .nullable(),
  position: z.number().optional(),
  column_id: z.string().optional(),
  due_date: z.string().optional().nullable(),
  labels: z.array(z.string()).optional().nullable(),
  checklist: z.array(z.string()).optional().nullable(),
  attachments: z.array(z.string()).optional().nullable(),
});

// Inferred types from schemas
export type CreateCardRequestFields = z.infer<typeof CreateCardRequestSchema>;
export type UpdateCardRequestFields = z.infer<typeof UpdateCardRequestSchema>;

// Response types
export interface GetCardsResponseFields {
  cards: Card[];
}

export type CreateCardResponseFields = Card;
export type UpdateCardResponseFields = Card;

export interface DeleteCardResponseFields {
  id: string;
  deleted: boolean;
}
