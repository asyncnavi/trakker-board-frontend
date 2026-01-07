// types/board.ts
import { z } from "zod";

export interface Board {
  id: string;
  name: string;
  description: string | null;
  background_url: string | null;
  owner_id: string;
  archived_at: string | null;
  inserted_at: string;
  updated_at: string;
}

export interface BoardCard {
  id: string;
  title: string;
  description: string | null;
  position: string;
  column_id: string;
  due_date: string | null;
  labels: string | null;
  checklist: string | null;
  attachments: string | null;
  inserted_at?: string;
  updated_at?: string;
}

export interface BoardColumn {
  id: string;
  name: string;
  position: number;
  background_color: string | null;
  cards?: BoardCard[] | null;
}

export interface FullBoard {
  id: string;
  name: string;
  description: string | null;
  background_url: string | null;
  owner_id: string;
  archived_at: string | null;
  inserted_at: string;
  updated_at: string;
  columns?: BoardColumn[] | null;
}

export const CreateBoardRequestSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  description: z.string().max(1000, "Description is too long").optional(),
  background_url: z.string().optional().nullable(),
});

export const UpdateBoardRequestSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name is too long")
    .optional(),
  description: z
    .string()
    .max(1000, "Description is too long")
    .optional()
    .nullable(),
  background_url: z.string().optional().nullable(),
});

export type CreateBoardRequestFields = z.infer<typeof CreateBoardRequestSchema>;
export type UpdateBoardRequestFields = z.infer<typeof UpdateBoardRequestSchema>;

export interface GetBoardsResponseFields {
  boards: Board[];
}

export type GetBoardResponseFields = FullBoard;

export interface CreateBoardResponseFields {
  data: Board;
}

export interface UpdateBoardResponseFields {
  data: Board;
}

export interface DeleteBoardResponseFields {
  data: {
    id: string;
    deleted: boolean;
  };
}

export interface ArchiveBoardResponseFields {
  data: Board;
}

export interface UnarchiveBoardResponseFields {
  data: Board;
}
