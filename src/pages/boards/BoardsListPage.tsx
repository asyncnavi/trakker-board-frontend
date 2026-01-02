import { Separator } from "@/components/ui/separator";
import MainLayout from "@/shared/MainLayout";
import { CreateBoard } from "./components/modals";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import useBoardStore from "@/store";
import { BoardItem } from "./components/BoardItem";
import { useNavigate } from "react-router";

export const iframeHeight = "800px";

export const description = "A sidebar with a header and a search form.";

export default function Boards() {
  const navigate = useNavigate();

  const [createModal, setCreateModal] = useState<boolean>(false);
  const boards = useBoardStore((state) => state.boards);
  const deleteBoard = useBoardStore((state) => state.deleteBoard);

  const handleCreateModal = () => setCreateModal(!createModal);
  const openCreateModal = () => setCreateModal(true);
  const closeCreateModal = () => setCreateModal(false);

  return (
    <MainLayout>
      <div className="px-2 py-4 w-full">
        <div className="flex justify-between w-full items-center">
          <h2 className="text-xl font-semibold">Boards</h2>

          <Button variant="outline" onClick={openCreateModal}>
            Create New Board
            <PlusIcon />
          </Button>
          <CreateBoard
            open={createModal}
            onOpenChange={handleCreateModal}
            onClose={closeCreateModal}
          />
        </div>
      </div>
      <Separator />

      <div className="grid grid-cols-4 gap-4 py-8 px-4 ">
        {boards.map((board) => {
          return (
            <div key={board.id} className="col-spa">
              <BoardItem
                board={board}
                actions={{
                  delete: () => {
                    deleteBoard(board.id);
                  },
                  view: () => {
                    navigate(`boards/${board.id}`);
                  },
                }}
              />
            </div>
          );
        })}
      </div>
    </MainLayout>
  );
}
