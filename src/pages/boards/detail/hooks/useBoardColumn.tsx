import { useState, useCallback, type ChangeEvent } from "react";
import { toast } from "sonner";

import { useCardMutations } from "@/services/card";
import type { BoardColumn, BoardCard } from "@/services/board";

interface UseBoardColumnState {
  isAddingCard: boolean;
  newCardTitle: string;
}

interface UseBoardColumnReturn {
  cards: BoardCard[];
  isAddingCard: boolean;
  newCardTitle: string;

  isCreatingCard: boolean;
  isDeletingCard: boolean;
  isMovingCard: boolean;

  handleToggleAddCard: () => void;
  handleNewCardTitleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleSaveCard: () => Promise<void>;
  handleCancelAddCard: () => void;
  handleDeleteCard: (cardId: string) => Promise<void>;
  handleMoveCard: (cardId: string, targetColumnId: string) => Promise<void>;
}

function useBoardColumn(
  boardId: string,
  column: BoardColumn,
): UseBoardColumnReturn {
  const [state, setState] = useState<UseBoardColumnState>({
    isAddingCard: false,
    newCardTitle: "",
  });
  const { createCard, updateCard, deleteCard } = useCardMutations(
    boardId,
    column.id,
  );

  const handleToggleAddCard = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isAddingCard: !prev.isAddingCard,
    }));
  }, []);

  const handleNewCardTitleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setState((prev) => ({
        ...prev,
        newCardTitle: event.target.value,
      }));
    },
    [],
  );

  const cards = column.cards ?? [];

  const handleSaveCard = useCallback(async () => {
    const title = state.newCardTitle.trim();

    if (!title) {
      setState((prev) => ({
        ...prev,
        isAddingCard: false,
        newCardTitle: "",
      }));
      return;
    }

    try {
      await createCard.mutateAsync({
        title,
        position: cards.length.toString(),
      });

      setState({
        isAddingCard: false,
        newCardTitle: "",
      });

      toast.success("Card created!");
    } catch (error) {
      toast.error("Failed to create card");
      console.error("Failed to create card:", error);
    }
  }, [state.newCardTitle, createCard, cards.length]);

  const handleCancelAddCard = useCallback(() => {
    setState({
      isAddingCard: false,
      newCardTitle: "",
    });
  }, []);

  const handleDeleteCard = useCallback(
    async (cardId: string) => {
      try {
        await deleteCard.mutateAsync(cardId);
        toast.success("Card deleted!");
      } catch (error) {
        toast.error("Failed to delete card");
        console.error("Failed to delete card:", error);
      }
    },
    [deleteCard],
  );

  const handleMoveCard = useCallback(
    async (cardId: string, targetColumnId: string) => {
      try {
        await updateCard.mutateAsync({
          id: cardId,
          data: {
            column_id: targetColumnId,
            position: 0, // TODO: Calculate proper position in target column
          },
        });

        toast.success("Card moved!");
      } catch (error) {
        toast.error("Failed to move card");
        console.error("Failed to move card:", error);
      }
    },
    [updateCard],
  );

  return {
    // State
    cards,
    isAddingCard: state.isAddingCard,
    newCardTitle: state.newCardTitle,

    // Mutation States
    isCreatingCard: createCard.isPending,
    isDeletingCard: deleteCard.isPending,
    isMovingCard: updateCard.isPending,

    // Handlers
    handleToggleAddCard,
    handleNewCardTitleChange,
    handleSaveCard,
    handleCancelAddCard,
    handleDeleteCard,
    handleMoveCard,
  };
}

export { useBoardColumn };
export type { UseBoardColumnReturn };
