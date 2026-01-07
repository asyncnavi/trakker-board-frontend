import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCards, getCard, createCard, updateCard, deleteCard } from "./card";
import type {
  Card,
  CreateCardRequestFields,
  UpdateCardRequestFields,
} from "./card.types";
import { boardKeys } from "../board/board.query";

import type { FullBoard, BoardCard } from "../board/board.types";

// Query Keys
export const cardKeys = {
  all: ["card"] as const,
  lists: () => [...cardKeys.all, "list"] as const,
  list: (boardId: string) => [...cardKeys.lists(), boardId] as const,
  details: () => [...cardKeys.all, "detail"] as const,
  detail: (id: string) => [...cardKeys.details(), id] as const,
};

// Query hook to get cards for a board
export const useCardsQuery = (boardId: string) => {
  return useQuery({
    queryKey: cardKeys.list(boardId),
    queryFn: () => getCards(boardId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!boardId,
  });
};

// Query hook to get a single card
export const useCardQuery = (id: string) => {
  return useQuery({
    queryKey: cardKeys.detail(id),
    queryFn: () => getCard(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id,
  });
};

export const useCardMutations = (boardId: string, columnId: string) => {
  const queryClient = useQueryClient();

  const createCardMutation = useMutation({
    mutationFn: (data: CreateCardRequestFields) => createCard(columnId, data),

    onMutate: async (newCardData) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.detail(boardId) });

      const previousBoard = queryClient.getQueryData<FullBoard>(
        boardKeys.detail(boardId),
      );

      if (previousBoard) {
        const tempCard: Card = {
          id: `temp-${Date.now()}`,
          title: newCardData.title,
          description: newCardData.description || null,
          position: newCardData.position,
          column_id: columnId,
          due_date: newCardData.due_date || null,
          labels: newCardData.labels || null,
          checklist: newCardData.checklist || null,
          attachments: newCardData.attachments || null,
        };

        // Add card to the correct column
        queryClient.setQueryData<FullBoard>(boardKeys.detail(boardId), {
          ...previousBoard,
          columns: previousBoard.columns?.map((col) =>
            col.id === columnId
              ? { ...col, cards: [...(col.cards || []), tempCard as BoardCard] }
              : col,
          ),
        });
      }

      return { previousBoard };
    },

    // On success, replace temp with real data
    onSuccess: (newCard) => {
      // Surgically update the board cache
      const currentBoard = queryClient.getQueryData<FullBoard>(
        boardKeys.detail(boardId),
      );

      if (currentBoard) {
        queryClient.setQueryData<FullBoard>(boardKeys.detail(boardId), {
          ...currentBoard,
          columns: currentBoard.columns?.map((col) =>
            col.id === columnId
              ? {
                  ...col,
                  cards: [
                    ...(col.cards || []).filter(
                      (card) => !card.id.startsWith("temp-"),
                    ),
                    newCard as BoardCard,
                  ],
                }
              : col,
          ),
        });
      }

      // Update cards list cache if it exists
      queryClient.setQueryData<Card[]>(cardKeys.list(boardId), (old) => [
        ...(old || []),
        newCard,
      ]);

      // Set individual card cache
      queryClient.setQueryData(cardKeys.detail(newCard.id), newCard);
    },

    // On error, rollback
    onError: (_err, _newCard, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(
          boardKeys.detail(boardId),
          context.previousBoard,
        );
      }
    },

    // Always refetch after error or success (safety net)
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });

  const updateCardMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCardRequestFields }) =>
      updateCard(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.detail(boardId) });
      await queryClient.cancelQueries({ queryKey: cardKeys.detail(id) });

      const previousBoard = queryClient.getQueryData<FullBoard>(
        boardKeys.detail(boardId),
      );
      const previousCard = queryClient.getQueryData<Card>(cardKeys.detail(id));

      // Optimistically update board cache
      if (previousBoard) {
        // Check if card is moving to a different column
        const isMovingColumns =
          data.column_id &&
          previousCard &&
          data.column_id !== previousCard.column_id;

        if (isMovingColumns) {
          // Moving between columns: remove from old, add to new
          queryClient.setQueryData<FullBoard>(boardKeys.detail(boardId), {
            ...previousBoard,
            columns: previousBoard.columns?.map((col) => {
              if (col.id === previousCard.column_id) {
                // Remove from old column
                return {
                  ...col,
                  cards: col.cards?.filter((card) => card.id !== id),
                };
              } else if (col.id === data.column_id) {
                // Add to new column
                const updatedCard = { ...previousCard, ...data } as BoardCard;
                return {
                  ...col,
                  cards: [...(col.cards || []), updatedCard],
                };
              }
              return col;
            }),
          });
        } else {
          // Just updating card fields in same column
          queryClient.setQueryData<FullBoard>(boardKeys.detail(boardId), {
            ...previousBoard,
            columns: previousBoard.columns?.map((col) => ({
              ...col,
              cards: col.cards?.map((card) =>
                card.id === id ? ({ ...card, ...data } as BoardCard) : card,
              ),
            })),
          });
        }
      }

      // Optimistically update single card cache
      if (previousCard) {
        queryClient.setQueryData<Card>(cardKeys.detail(id), {
          ...previousCard,
          ...data,
        } as Card);
      }

      return { previousBoard, previousCard };
    },

    onSuccess: (updatedCard) => {
      // Surgically update the board cache with actual server response
      const currentBoard = queryClient.getQueryData<FullBoard>(
        boardKeys.detail(boardId),
      );

      if (currentBoard) {
        queryClient.setQueryData<FullBoard>(boardKeys.detail(boardId), {
          ...currentBoard,
          columns: currentBoard.columns?.map((col) => {
            if (col.id === updatedCard.column_id) {
              // Ensure card is in the correct column
              const cardExists = col.cards?.some(
                (c) => c.id === updatedCard.id,
              );
              if (cardExists) {
                return {
                  ...col,
                  cards: col.cards?.map((card) =>
                    card.id === updatedCard.id
                      ? (updatedCard as BoardCard)
                      : card,
                  ),
                };
              } else {
                // Card moved to this column, add it
                return {
                  ...col,
                  cards: [...(col.cards || []), updatedCard as BoardCard],
                };
              }
            } else {
              // Remove card from other columns if it exists there
              return {
                ...col,
                cards: col.cards?.filter((card) => card.id !== updatedCard.id),
              };
            }
          }),
        });
      }

      // Update cards list cache
      queryClient.setQueryData<Card[]>(cardKeys.list(boardId), (old) =>
        (old || []).map((card) =>
          card.id === updatedCard.id ? updatedCard : card,
        ),
      );

      // Update single card cache
      queryClient.setQueryData(cardKeys.detail(updatedCard.id), updatedCard);
    },

    onError: (_err, variables, context) => {
      // Rollback board
      if (context?.previousBoard) {
        queryClient.setQueryData(
          boardKeys.detail(boardId),
          context.previousBoard,
        );
      }
      // Rollback card
      if (context?.previousCard) {
        queryClient.setQueryData(
          cardKeys.detail(variables.id),
          context.previousCard,
        );
      }
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: (id: string) => deleteCard(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.detail(boardId) });
      await queryClient.cancelQueries({ queryKey: cardKeys.detail(id) });

      const previousBoard = queryClient.getQueryData<FullBoard>(
        boardKeys.detail(boardId),
      );

      // Optimistically remove card
      if (previousBoard) {
        queryClient.setQueryData<FullBoard>(boardKeys.detail(boardId), {
          ...previousBoard,
          columns: previousBoard.columns?.map((col) => ({
            ...col,
            cards: col.cards?.filter((card) => card.id !== id),
          })),
        });
      }

      return { previousBoard };
    },

    onSuccess: (_, deletedId) => {
      // Surgically remove from board cache
      const currentBoard = queryClient.getQueryData<FullBoard>(
        boardKeys.detail(boardId),
      );

      if (currentBoard) {
        queryClient.setQueryData<FullBoard>(boardKeys.detail(boardId), {
          ...currentBoard,
          columns: currentBoard.columns?.map((col) => ({
            ...col,
            cards: col.cards?.filter((card) => card.id !== deletedId),
          })),
        });
      }

      // Remove from cards list cache
      queryClient.setQueryData<Card[]>(cardKeys.list(boardId), (old) =>
        (old || []).filter((card) => card.id !== deletedId),
      );

      // Remove from single card cache
      queryClient.removeQueries({ queryKey: cardKeys.detail(deletedId) });
    },

    onError: (_err, _deletedId, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(
          boardKeys.detail(boardId),
          context.previousBoard,
        );
      }
    },
  });

  return {
    createCard: createCardMutation,
    updateCard: updateCardMutation,
    deleteCard: deleteCardMutation,
  };
};
