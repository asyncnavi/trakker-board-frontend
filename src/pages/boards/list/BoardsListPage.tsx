import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { PlusIcon, Archive } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import MainLayout from "@/shared/MainLayout";
import { useBoardsQuery, useBoardMutations } from "@/services/board";

import { CreateBoardModal } from "./modals";
import { BoardItem } from "./components";

interface BoardsListPageState {
  isCreateModalOpen: boolean;
  showArchived: boolean;
}

function BoardsListPage() {
  const navigate = useNavigate();

  const [state, setState] = useState<BoardsListPageState>({
    isCreateModalOpen: false,
    showArchived: false,
  });

  const { data, isLoading, error } = useBoardsQuery();
  const { deleteBoard } = useBoardMutations();

  const allBoards = data?.boards ?? [];

  // Filter boards based on archive status
  const boards = state.showArchived
    ? allBoards.filter((board) => board.archived_at !== null)
    : allBoards.filter((board) => board.archived_at === null);

  const archivedCount = allBoards.filter(
    (board) => board.archived_at !== null,
  ).length;

  const openCreateModal = useCallback(() => {
    setState((prev) => ({ ...prev, isCreateModalOpen: true }));
  }, []);

  const closeCreateModal = useCallback(() => {
    setState((prev) => ({ ...prev, isCreateModalOpen: false }));
  }, []);

  const handleCreateModalChange = useCallback((open: boolean) => {
    setState((prev) => ({ ...prev, isCreateModalOpen: open }));
  }, []);

  const toggleArchiveFilter = useCallback(() => {
    setState((prev) => ({ ...prev, showArchived: !prev.showArchived }));
  }, []);

  const handleDeleteBoard = useCallback(
    (boardId: string) => {
      deleteBoard.mutate(boardId, {
        onSuccess: () => {
          toast.success("Board deleted successfully");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to delete board");
        },
      });
    },
    [deleteBoard],
  );

  const handleViewBoard = useCallback(
    (boardId: string) => {
      navigate(`boards/${boardId}`);
    },
    [navigate],
  );

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading boards...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500">Error loading boards: {error.message}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="px-2 py-4 w-full">
        <div className="flex justify-between w-full items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Boards</h2>
            {archivedCount > 0 && (
              <Button
                variant={state.showArchived ? "default" : "outline"}
                size="sm"
                onClick={toggleArchiveFilter}
              >
                <Archive className="w-4 h-4 mr-2" />
                {state.showArchived
                  ? "Show Active"
                  : `Archived (${archivedCount})`}
              </Button>
            )}
          </div>

          <Button variant="outline" onClick={openCreateModal}>
            Create New Board
            <PlusIcon />
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-4 gap-4 py-8 px-4">
        {boards.length === 0 ? (
          <div className="col-span-4 text-center py-12 text-muted-foreground">
            {state.showArchived ? (
              <p>No archived boards.</p>
            ) : (
              <p>No boards yet. Create your first board to get started!</p>
            )}
          </div>
        ) : (
          boards.map((board) => (
            <div key={board.id} className="col-span-1">
              <BoardItem
                board={board}
                onDelete={() => handleDeleteBoard(board.id)}
                onView={() => handleViewBoard(board.id)}
              />
            </div>
          ))
        )}
      </div>

      <CreateBoardModal
        open={state.isCreateModalOpen}
        onOpenChange={handleCreateModalChange}
        onClose={closeCreateModal}
      />
    </MainLayout>
  );
}

export { BoardsListPage };
