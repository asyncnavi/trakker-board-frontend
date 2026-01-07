import { authedClient } from "../index";
import type { APIReponse } from "../index";
import type {
  Column,
  ColumnWithCards,
  CreateColumnRequestFields,
  UpdateColumnRequestFields,
  ReorderColumnsRequestFields,
  GetColumnsResponseFields,
  DeleteColumnResponseFields,
} from "./column.types";

// GET /api/boards/:board_id/columns - List all columns for a board
export async function getColumns(boardId: string): Promise<ColumnWithCards[]> {
  const response = await authedClient.get<APIReponse<GetColumnsResponseFields>>(
    `/boards/${boardId}/columns`,
  );

  if (response.data.error) {
    throw new Error(response.data.error.message || "Failed to fetch columns");
  }

  if (!response.data.data) {
    throw new Error("No columns data returned");
  }

  return response.data.data.columns;
}

// POST /api/boards/:board_id/columns - Create column
export async function createColumn(
  boardId: string,
  data: CreateColumnRequestFields,
): Promise<Column> {
  const response = await authedClient.post<APIReponse<Column>>(
    `/boards/${boardId}/columns`,
    data,
  );

  if (response.data.error) {
    throw new Error(response.data.error.message || "Failed to create column");
  }

  if (!response.data.data) {
    throw new Error("No column data returned");
  }

  return response.data.data;
}

// PATCH /api/columns/:id - Update column
export async function updateColumn(
  id: string,
  data: UpdateColumnRequestFields,
): Promise<Column> {
  console.log(data);

  const response = await authedClient.patch<APIReponse<Column>>(
    `/columns/${id}`,
    data,
  );

  if (response.data.error) {
    throw new Error(response.data.error.message || "Failed to update column");
  }

  if (!response.data.data) {
    throw new Error("No column data returned");
  }

  return response.data.data;
}

// DELETE /api/columns/:id - Delete column
export async function deleteColumn(
  id: string,
): Promise<DeleteColumnResponseFields> {
  const response = await authedClient.delete<
    APIReponse<DeleteColumnResponseFields>
  >(`/columns/${id}`);

  if (response.data.error) {
    throw new Error(response.data.error.message || "Failed to delete column");
  }

  if (!response.data.data) {
    throw new Error("No delete confirmation returned");
  }

  return response.data.data;
}

// PATCH /api/boards/:board_id/columns/reorder - Reorder columns
export async function reorderColumns(
  boardId: string,
  data: ReorderColumnsRequestFields,
): Promise<ColumnWithCards[]> {
  const response = await authedClient.patch<
    APIReponse<{ columns: ColumnWithCards[] }>
  >(`/boards/${boardId}/columns/reorder`, data);

  if (response.data.error) {
    throw new Error(response.data.error.message || "Failed to reorder columns");
  }

  if (!response.data.data) {
    throw new Error("No columns data returned");
  }

  return response.data.data.columns;
}
