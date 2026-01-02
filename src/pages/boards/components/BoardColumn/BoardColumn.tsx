import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2Icon, PlusIcon } from "lucide-react";
import { type Column } from "@/store";
import useBoardColumn from "./useBoardColumn";
import { BoardCard } from "../BoardCard";
import { ViewBoardCard, AddColumn } from "../modals";
import { useDroppable } from "@dnd-kit/core";
import { useState } from "react";
import clsx from "clsx";

const COLUMN_COLOR_MAP: Record<string, string> = {
  gray: "bg-gray-100",
  red: "bg-red-100",
  orange: "bg-orange-100",
  amber: "bg-amber-100",
  yellow: "bg-yellow-100",
  lime: "bg-lime-100",
  green: "bg-green-100",
  teal: "bg-teal-100",
  blue: "bg-blue-100",
  purple: "bg-purple-100",
};

const BoardColumn = ({ column }: { column: Column }) => {
  const {
    cards,
    otherColumns,
    isAddingCard,
    newCardTitle,
    currentViewCardId,
    isViewModalOpen,
    handleToggleAddCard,
    handleNewCardTitleChange,
    handleSaveCard,
    handleCancelAddCard,
    handleDeleteCard,
    handleMoveCard,
    handleOpenViewModal,
    handleCloseViewModal,
    handleViewModalOpenChange,
  } = useBoardColumn(column);

  const [isEditColumnOpen, setIsEditColumnOpen] = useState(false);

  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const handleOpenEditColumn = () => setIsEditColumnOpen(true);
  const handleCloseEditColumn = () => setIsEditColumnOpen(false);

  const columnColorClass = column.color ? COLUMN_COLOR_MAP[column.color] : "";

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "w-[300px] min-w-[300px] border p-4 rounded-lg",
        columnColorClass,
      )}
    >
      <div className="flex justify-between items-center my-4">
        <h3 className="text-xl">{column.name}</h3>
        <Button size="icon-sm" variant="ghost" onClick={handleOpenEditColumn}>
          <Edit2Icon />
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {cards?.map((card) => (
          <BoardCard
            key={card.id}
            card={card}
            columnName={column.name}
            otherColumns={otherColumns}
            actions={{
              delete: handleDeleteCard,
              move: handleMoveCard,
              view: handleOpenViewModal,
            }}
          />
        ))}
      </div>

      <ViewBoardCard
        onClose={handleCloseViewModal}
        open={isViewModalOpen}
        onOpenChange={handleViewModalOpenChange}
        cardId={currentViewCardId as string}
      />

      <AddColumn
        open={isEditColumnOpen}
        onOpenChange={setIsEditColumnOpen}
        onClose={handleCloseEditColumn}
        boardId={column.boardId}
        column={column}
      />

      <div className="py-4">
        {isAddingCard ? (
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Card Title"
              value={newCardTitle}
              onChange={handleNewCardTitleChange}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveCard}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelAddCard}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full my-2 mx-2"
            onClick={handleToggleAddCard}
          >
            <PlusIcon />
            Add a card
          </Button>
        )}
      </div>
    </div>
  );
};

export default BoardColumn;
