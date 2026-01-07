import { z } from "zod";
import type { BoardCard } from "../board/board.types";

// Base Column interface (matches your BoardColumn)
export interface Column {
  id: string;
  name: string;
  position: number;
  background_color: string | null;
  board_id: string;
  inserted_at?: string;
  updated_at?: string;
}

// Column with cards (for GET responses)
export interface ColumnWithCards extends Column {
  cards?: BoardCard[] | null;
}

// Request Schemas
export const CreateColumnRequestSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  position: z.number().min(0, "Position must be non-negative"),
  background_color: z.string().max(50).optional().nullable(),
});

export const UpdateColumnRequestSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name is too long")
    .optional(),
  position: z.number().min(0, "Position must be non-negative").optional(),
  background_color: z.string().max(50).optional().nullable(),
});

export const ReorderColumnsRequestSchema = z.object({
  column_orders: z.array(
    z.object({
      id: z.string(),
      position: z.number().min(0, "Position must be non-negative"),
    }),
  ),
});

// Inferred types from schemas
export type CreateColumnRequestFields = z.infer<
  typeof CreateColumnRequestSchema
>;
export type UpdateColumnRequestFields = z.infer<
  typeof UpdateColumnRequestSchema
>;
export type ReorderColumnsRequestFields = z.infer<
  typeof ReorderColumnsRequestSchema
>;

// Response types
export interface GetColumnsResponseFields {
  columns: ColumnWithCards[];
}

export type CreateColumnResponseFields = Column;
export type UpdateColumnResponseFields = Column;
export type ReorderColumnsResponseFields = ColumnWithCards[];

export interface DeleteColumnResponseFields {
  id: string;
  deleted: boolean;
}
