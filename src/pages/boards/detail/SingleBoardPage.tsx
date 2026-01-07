import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { ArrowLeftIcon, PlusIcon, Settings, ArrowUpDown } from "lucide-react";
import clsx from "clsx";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import MainLayout from "@/shared/MainLayout";
import {
  useBoardQuery,
  type BoardCard as BoardCardType,
} from "@/services/board";
import { useCardMutations } from "@/services/card";
import type { ColumnWithCards } from "@/services/column/column.types";

import { BoardColumn, BoardCard } from "./components";
import {
  CreateColumnModal,
  EditBoardModal,
  ReorderColumnsModal,
} from "./modals";

interface DragState {
  activeCard: BoardCardType | null;
  activeColumnId: string;
}

interface ModalState {
  isAddColumnOpen: boolean;
  isEditBoardOpen: boolean;
  isReorderColumnsOpen: boolean;
}

function SingleBoardPage() {
  const navigate = useNavigate();
  const { boardId } = useParams<{ boardId: string }>();

  const [dragState, setDragState] = useState<DragState>({
    activeCard: null,
    activeColumnId: "",
  });

  const [modalState, setModalState] = useState<ModalState>({
    isAddColumnOpen: false,
    isEditBoardOpen: false,
    isReorderColumnsOpen: false,
  });

  const { data: board, isLoading, error } = useBoardQuery(boardId || "");
  const { updateCard } = useCardMutations(
    boardId || "",
    dragState.activeColumnId,
  );

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const openAddColumnModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isAddColumnOpen: true }));
  }, []);

  const closeAddColumnModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isAddColumnOpen: false }));
  }, []);

  const handleAddColumnModalChange = useCallback((open: boolean) => {
    setModalState((prev) => ({ ...prev, isAddColumnOpen: open }));
  }, []);

  const openEditBoardModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isEditBoardOpen: true }));
  }, []);

  const closeEditBoardModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isEditBoardOpen: false }));
  }, []);

  const handleEditBoardModalChange = useCallback((open: boolean) => {
    setModalState((prev) => ({ ...prev, isEditBoardOpen: open }));
  }, []);

  const openReorderColumnsModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isReorderColumnsOpen: true }));
  }, []);

  const closeReorderColumnsModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isReorderColumnsOpen: false }));
  }, []);

  const handleReorderColumnsModalChange = useCallback((open: boolean) => {
    setModalState((prev) => ({ ...prev, isReorderColumnsOpen: open }));
  }, []);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const cardId = event.active.id as string;

      // Find the card and its column in the board
      let foundCard: BoardCardType | null = null;
      let foundColumnId = "";

      board?.columns?.forEach((column) => {
        const card = column.cards?.find((c) => c.id === cardId);
        if (card) {
          foundCard = card;
          foundColumnId = column.id;
        }
      });

      setDragState({
        activeCard: foundCard,
        activeColumnId: foundColumnId,
      });
    },
    [board?.columns],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      // Reset drag state first
      const currentCard = dragState.activeCard;
      setDragState({ activeCard: null, activeColumnId: "" });

      // If dropped outside a valid drop zone, do nothing
      if (!over || !currentCard) {
        return;
      }

      const cardId = active.id as string;
      const targetColumnId = over.id as string;

      // Only update if moving to a different column
      if (currentCard.column_id !== targetColumnId) {
        try {
          await updateCard.mutateAsync({
            id: cardId,
            data: {
              column_id: targetColumnId,
              position: 0,
            },
          });
        } catch (error) {
          console.error("Failed to move card:", error);
        }
      }
    },
    [dragState.activeCard, updateCard],
  );

  if (!boardId) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <p>Board ID not found</p>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading board...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !board) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500">{error?.message || "Board not found"}</p>
        </div>
      </MainLayout>
    );
  }

  const columns = board.columns ?? [];
  const hasBackgroundImage =
    !!board.background_url && board.background_url !== "";

  return (
    <MainLayout>
      {/* Header */}
      <div className="px-2 py-4 w-full">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-8">
            <Button size="icon" variant="outline" onClick={handleGoBack}>
              <ArrowLeftIcon />
            </Button>
            <div>
              <h2 className="text-xl font-semibold">{board.name}</h2>
              {board.description && (
                <p className="text-sm text-muted-foreground">
                  {board.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={openReorderColumnsModal}
            >
              <ArrowUpDown className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={openEditBoardModal}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <div
        className={clsx(
          "flex p-8 gap-4 shrink-0 overflow-x-auto min-h-[calc(100vh-120px)]",
          !hasBackgroundImage && "bg-gray-50",
        )}
        style={
          hasBackgroundImage
            ? {
                backgroundImage: `url(${board.background_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }
            : undefined
        }
      >
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {columns.map((column) => {
            const otherColumns = columns.filter((c) => c.id !== column.id);
            return (
              <BoardColumn
                key={column.id}
                column={column}
                boardId={board.id}
                otherColumns={otherColumns}
              />
            );
          })}

          <DragOverlay>
            {dragState.activeCard && (
              <BoardCard
                card={dragState.activeCard}
                columnName=""
                otherColumns={[]}
                isDragging
              />
            )}
          </DragOverlay>
        </DndContext>

        <Button
          variant="outline"
          className="my-2 mx-2"
          onClick={openAddColumnModal}
        >
          <PlusIcon />
          Add Column
        </Button>

        {/* Add Column Modal */}
        <CreateColumnModal
          open={modalState.isAddColumnOpen}
          onOpenChange={handleAddColumnModalChange}
          onClose={closeAddColumnModal}
          boardId={boardId}
        />

        {/* Edit Board Modal */}
        <EditBoardModal
          open={modalState.isEditBoardOpen}
          onOpenChange={handleEditBoardModalChange}
          onClose={closeEditBoardModal}
          board={board}
        />

        {/* Reorder Columns Modal */}
        <ReorderColumnsModal
          open={modalState.isReorderColumnsOpen}
          onOpenChange={handleReorderColumnsModalChange}
          onClose={closeReorderColumnsModal}
          boardId={board.id}
          columns={(board.columns || []) as ColumnWithCards[]}
        />
      </div>
    </MainLayout>
  );
}

export { SingleBoardPage };
