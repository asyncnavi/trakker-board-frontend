import { Separator } from "@/components/ui/separator";
import MainLayout from "@/shared/MainLayout";
import { useNavigate, useParams } from "react-router";
import useBoardStore, { type Card } from "@/store";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import { BoardColumn } from "./components/BoardColumn";
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { BoardCard } from "./components/BoardCard";
import { AddColumn } from "./components/modals";
import { useShallow } from "zustand/shallow";

export const iframeHeight = "800px";

export const description = "A sidebar with a header and a search form.";

export default function SingleBoard() {
  const navigate = useNavigate();
  const { boardId } = useParams();

  const board = useBoardStore(
    useShallow((state) => state.boards.find((b) => b.id === boardId)),
  );

  const columns = useBoardStore(
    useShallow((state) => state.columns.filter((c) => c.boardId === boardId)),
  );

  const moveCard = useBoardStore((state) => state.moveCard);
  const getCard = useBoardStore((state) => state.getCard);

  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);

  if (!boardId || !board) {
    return <div>Could not find board</div>;
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // If dropped outside a valid drop zone, do nothing
    if (!over) return;

    const cardId = active.id as string;
    const targetColumnId = over.id as string;

    moveCard(cardId, targetColumnId);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const card = getCard(event.active.id as string);
    setActiveCard(card ?? null);
  };

  const handleOpenAddColumn = () => setIsAddColumnOpen(true);
  const handleCloseAddColumn = () => setIsAddColumnOpen(false);

  return (
    <MainLayout>
      <div className="px-2 py-4 w-full">
        <div className="flex w-full items-center gap-8">
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              navigate(-1);
            }}
          >
            <ArrowLeftIcon />
          </Button>
          <h2 className="text-xl font-semibold">{board.name}</h2>
        </div>
      </div>
      <Separator />
      <div className="flex p-8 gap-4 shrink-0 overflow-scroll">
        <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
          {columns?.map((col) => {
            return <BoardColumn key={col.id} column={col} />;
          })}

          <DragOverlay>
            {activeCard ? (
              <BoardCard
                card={activeCard}
                columnName=""
                otherColumns={[]}
                isDragging
              />
            ) : null}
          </DragOverlay>
        </DndContext>

        <Button
          variant="outline"
          className="my-2 mx-2"
          onClick={handleOpenAddColumn}
        >
          <PlusIcon />
          Add Column
        </Button>

        <AddColumn
          open={isAddColumnOpen}
          onOpenChange={setIsAddColumnOpen}
          onClose={handleCloseAddColumn}
          boardId={boardId}
        />
      </div>
    </MainLayout>
  );
}
