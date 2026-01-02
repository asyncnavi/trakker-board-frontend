import useBoardStore, { type Column } from "@/store";
import { useShallow } from "zustand/shallow";
import { useState, type ChangeEventHandler } from "react";

const useBoardColumn = (column: Column) => {
  // State
  const [isAddingCard, setIsAddingCard] = useState<boolean>(false);
  const [newCardTitle, setNewCardTitle] = useState<string>("");
  const [currentViewCardId, setCurrentViewCardId] = useState<string | null>(
    null,
  );

  const cards = useBoardStore(
    useShallow((state) =>
      state.cards.filter(
        (card) =>
          card.boardId === column.boardId && card.columnId === column.id,
      ),
    ),
  );

  const otherColumns = useBoardStore(
    useShallow((state) =>
      state.columns.filter(
        (col) => col.boardId === column.boardId && col.id !== column.id,
      ),
    ),
  );

  // Actions
  const createCard = useBoardStore((state) => state.createCard);
  const deleteCard = useBoardStore((state) => state.deleteCard);
  const moveCard = useBoardStore((state) => state.moveCard);

  // Handlers
  const handleToggleAddCard = () => {
    setIsAddingCard((prev) => !prev);
  };

  const handleNewCardTitleChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    setNewCardTitle(event.currentTarget.value);
  };

  const handleSaveCard = () => {
    if (newCardTitle.trim() !== "") {
      const now = new Date().toISOString();
      createCard({
        id: crypto.randomUUID(),
        name: newCardTitle,
        boardId: column.boardId,
        columnId: column.id,
        description: null,
        tags: [],
        position: cards.length,
        priority: null,
        dueDate: null,
        createdAt: now,
        updatedAt: now,
      });
      setNewCardTitle("");
    }
    setIsAddingCard(false);
  };

  const handleCancelAddCard = () => {
    setNewCardTitle("");
    setIsAddingCard(false);
  };

  const handleDeleteCard = (cardId: string) => {
    deleteCard(cardId);
  };

  const handleMoveCard = (cardId: string, targetColumnId: string) => {
    moveCard(cardId, targetColumnId);
  };

  // View Modal Handlers
  const handleOpenViewModal = (cardId: string) => {
    setCurrentViewCardId(cardId);
  };

  const handleCloseViewModal = () => {
    setCurrentViewCardId(null);
  };

  const handleViewModalOpenChange = (open: boolean) => {
    if (!open) {
      setCurrentViewCardId(null);
    }
  };

  return {
    // State
    cards,
    otherColumns,
    isAddingCard,
    newCardTitle,
    currentViewCardId,
    isViewModalOpen: currentViewCardId !== null,

    // Handlers
    handleToggleAddCard,
    handleNewCardTitleChange,
    handleSaveCard,
    handleCancelAddCard,
    handleDeleteCard,
    handleMoveCard,
    handleOpenViewModal,
    handleCloseViewModal,
    handleViewModalOpenChange,
  };
};

export default useBoardColumn;
