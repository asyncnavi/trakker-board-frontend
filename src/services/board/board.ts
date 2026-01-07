import { authedClient } from "../index";
import type { APIReponse } from "../index";
import type {
  Board,
  CreateBoardRequestFields,
  FullBoard,
  GetBoardsResponseFields,
  UpdateBoardRequestFields,
} from "./board.types";

// GET /api/boards - List all boards
export async function getBoards(): Promise<GetBoardsResponseFields> {
  const response =
    await authedClient.get<APIReponse<GetBoardsResponseFields>>("/boards");

  console.log(response);
  if (response.data.error) {
    throw new Error(response.data.error.message || "Failed to fetch boards");
  }

  if (!response.data.data) {
    throw new Error("No boards data returned");
  }

  return response.data.data;
}

// GET /api/boards/:id - Get single board
export async function getBoard(id: string): Promise<FullBoard> {
  const response = await authedClient.get<APIReponse<FullBoard>>(
    `/boards/${id}`,
  );

  if (response.data.error) {
    throw new Error(response.data.error.message || "Failed to fetch board");
  }

  if (!response.data.data) {
    throw new Error("No board data returned");
  }

  return response.data.data;
}

// POST /api/boards - Create board
export async function createBoard(
  data: CreateBoardRequestFields,
): Promise<Board> {
  const response = await authedClient.post<APIReponse<Board>>("/boards", data);

  if (response.data.error) {
    throw new Error(response.data.error.message || "Failed to create board");
  }

  if (!response.data.data) {
    throw new Error("No board data returned");
  }

  return response.data.data;
}

// PATCH /api/boards/:id - Update board
export async function updateBoard(
  id: string,
  data: UpdateBoardRequestFields,
): Promise<Board> {
  const response = await authedClient.patch<APIReponse<Board>>(
    `/boards/${id}`,
    data,
  );

  if (response.data.error) {
    throw new Error(response.data.error.message || "Failed to update board");
  }

  if (!response.data.data) {
    throw new Error("No board data returned");
  }

  return response.data.data;
}

// DELETE /api/boards/:id - Delete board
export async function deleteBoard(
  id: string,
): Promise<{ id: string; deleted: boolean }> {
  const response = await authedClient.delete<
    APIReponse<{ id: string; deleted: boolean }>
  >(`/boards/${id}`);

  if (response.data.error) {
    throw new Error(response.data.error.message || "Failed to delete board");
  }

  if (!response.data.data) {
    throw new Error("No delete confirmation returned");
  }

  return response.data.data;
}

// PATCH /api/boards/:id/archive - Archive board
export async function archiveBoard(id: string): Promise<Board> {
  const response = await authedClient.patch<APIReponse<Board>>(
    `/boards/${id}/archive`,
  );

  if (response.data.error) {
    throw new Error(response.data.error.message || "Failed to archive board");
  }

  if (!response.data.data) {
    throw new Error("No board data returned");
  }

  return response.data.data;
}

// PATCH /api/boards/:id/unarchive - Unarchive board
export async function unarchiveBoard(id: string): Promise<Board> {
  const response = await authedClient.patch<APIReponse<Board>>(
    `/boards/${id}/unarchive`,
  );

  if (response.data.error) {
    throw new Error(response.data.error.message || "Failed to unarchive board");
  }

  if (!response.data.data) {
    throw new Error("No board data returned");
  }

  return response.data.data;
}
