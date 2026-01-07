import { useState, useCallback, type ChangeEvent } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Edit2Icon, PlusIcon } from "lucide-react";
import clsx from "clsx";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BoardColumn as BoardColumnType } from "@/services/board";

import { COLUMN_COLOR_MAP } from "../../constants";
import { useBoardColumn } from "../hooks";

import { EditCardModal, EditColumnModal } from "../modals";
import { BoardCard } from "./BoardCard";

interface BoardColumnProps {
  boardId: string;
  column: BoardColumnType;
  otherColumns: BoardColumnType[];
}

interface ColumnModalState {
  isEditColumnOpen: boolean;
  isCardViewOpen: boolean;
  viewingCardId: string | null;
}

function BoardColumn({ boardId, column, otherColumns }: BoardColumnProps) {
  const {
    cards,
    isAddingCard,
    newCardTitle,
    isCreatingCard,
    handleToggleAddCard,
    handleNewCardTitleChange,
    handleSaveCard,
    handleCancelAddCard,
    handleDeleteCard,
    handleMoveCard,
  } = useBoardColumn(boardId, column);

  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const [modalState, setModalState] = useState<ColumnModalState>({
    isEditColumnOpen: false,
    isCardViewOpen: false,
    viewingCardId: null,
  });

  const openEditColumnModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isEditColumnOpen: true }));
  }, []);

  const closeEditColumnModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isEditColumnOpen: false }));
  }, []);

  const handleEditColumnModalChange = useCallback((open: boolean) => {
    setModalState((prev) => ({ ...prev, isEditColumnOpen: open }));
  }, []);

  const openCardViewModal = useCallback((cardId: string) => {
    setModalState((prev) => ({
      ...prev,
      isCardViewOpen: true,
      viewingCardId: cardId,
    }));
  }, []);

  const closeCardViewModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      isCardViewOpen: false,
      viewingCardId: null,
    }));
  }, []);

  const handleCardViewModalChange = useCallback((open: boolean) => {
    if (!open) {
      setModalState((prev) => ({
        ...prev,
        isCardViewOpen: false,
        viewingCardId: null,
      }));
    }
  }, []);

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handleNewCardTitleChange(event);
    },
    [handleNewCardTitleChange],
  );

  const columnColorClass = column.background_color
    ? COLUMN_COLOR_MAP[column.background_color]
    : "";

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "w-[300px] min-w-[300px] border p-4 rounded-lg",
        columnColorClass,
      )}
    >
      <div className="flex justify-between items-center my-4">
        <h3 className="text-xl font-medium">{column.name}</h3>
        <Button size="icon-sm" variant="ghost" onClick={openEditColumnModal}>
          <Edit2Icon />
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {cards.map((card) => (
          <BoardCard
            key={card.id}
            card={card}
            columnName={column.name}
            otherColumns={otherColumns}
            onDelete={handleDeleteCard}
            onMove={handleMoveCard}
            onView={openCardViewModal}
          />
        ))}
      </div>

      <div className="py-4">
        {isAddingCard ? (
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Card Title"
              value={newCardTitle}
              onChange={handleInputChange}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSaveCard}
                disabled={isCreatingCard}
              >
                {isCreatingCard ? "Saving..." : "Save"}
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelAddCard}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleToggleAddCard}
          >
            <PlusIcon className="mr-1" />
            Add a card
          </Button>
        )}
      </div>

      <EditColumnModal
        open={modalState.isEditColumnOpen}
        onOpenChange={handleEditColumnModalChange}
        onClose={closeEditColumnModal}
        boardId={boardId}
        column={column}
      />

      {modalState.viewingCardId && (
        <EditCardModal
          open={modalState.isCardViewOpen}
          onOpenChange={handleCardViewModalChange}
          onClose={closeCardViewModal}
          cardId={modalState.viewingCardId}
          columnId={column.id}
        />
      )}
    </div>
  );
}

export { BoardColumn };
