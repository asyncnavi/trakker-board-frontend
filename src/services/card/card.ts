import { authedClient } from "../index";
import type { APIReponse } from "../index";
import type {
  Card,
  CreateCardRequestFields,
  UpdateCardRequestFields,
  GetCardsResponseFields,
  DeleteCardResponseFields,
} from "./card.types";

// GET /api/boards/:board_id/cards - List all cards for a board
export async function getCards(boardId: string): Promise<Card[]> {
  const response = await authedClient.get<APIReponse<GetCardsResponseFields>>(
    `/boards/${boardId}/cards`,
  );

  if (response.data.error) {
    throw new Error(response.data.error.message || "Failed to fetch cards");
  }

  if (!response.data.data) {
    throw new Error("No cards data returned");
  }

  return response.data.data.cards;
}

export async function getCard(id: string): Promise<Card> {
  const response = await authedClient.get<APIReponse<Card>>(`/cards/${id}`);

  if (response.data.error) {
    throw new Error(response.data.error.message || "Failed to fetch card");
  }

  if (!response.data.data) {
    throw new Error("No card data returned");
  }

  return response.data.data;
}

// POST /api/columns/:column_id/cards - Create card
// Note: Check your backend for the actual endpoint. Common patterns:
// - /api/columns/:column_id/cards
// - /api/cards (with column_id in body)
export async function createCard(
  columnId: string,
  data: CreateCardRequestFields,
): Promise<Card> {
  // Assuming endpoint is /api/columns/:column_id/cards
  // Update this if your backend uses a different pattern
  const response = await authedClient.post<APIReponse<Card>>(
    `/columns/${columnId}/cards`,
    data,
  );

  if (response.data.error) {
    throw new Error(response.data.error.message || "Failed to create card");
  }

  if (!response.data.data) {
    throw new Error("No card data returned");
  }

  return response.data.data;
}

// PATCH /api/cards/:id - Update card
export async function updateCard(
  id: string,
  data: UpdateCardRequestFields,
): Promise<Card> {
  const response = await authedClient.patch<APIReponse<Card>>(
    `/cards/${id}`,
    data,
  );

  if (response.data.error) {
    throw new Error(response.data.error.message || "Failed to update card");
  }

  if (!response.data.data) {
    throw new Error("No card data returned");
  }

  return response.data.data;
}

// DELETE /api/cards/:id - Delete card
export async function deleteCard(
  id: string,
): Promise<DeleteCardResponseFields> {
  const response = await authedClient.delete<
    APIReponse<DeleteCardResponseFields>
  >(`/cards/${id}`);

  if (response.data.error) {
    throw new Error(response.data.error.message || "Failed to delete card");
  }

  if (!response.data.data) {
    throw new Error("No delete confirmation returned");
  }

  return response.data.data;
}
