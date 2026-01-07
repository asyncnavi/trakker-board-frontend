import { useCallback, type FC, type MouseEvent } from "react";
import { Edit2Icon, Trash2Icon, Archive } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Board } from "@/services/board";

interface BoardItemProps {
  board: Board;
  onDelete?: () => void;
  onEdit?: () => void;
  onView?: () => void;
}

const BoardItem: FC<BoardItemProps> = ({ board, onDelete, onEdit, onView }) => {
  const handleCardClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      onView?.();
    },
    [onView],
  );

  const handleDeleteClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onDelete?.();
    },
    [onDelete],
  );

  const handleEditClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onEdit?.();
    },
    [onEdit],
  );

  const hasActions = onEdit || onDelete;
  const isArchived = !!board.archived_at;

  return (
    <Card className="cursor-pointer w-full" onClick={handleCardClick}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>{board.name}</CardTitle>
          {isArchived && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              <Archive className="w-3 h-3" />
              Archived
            </span>
          )}
        </div>
        <CardDescription>{board.description}</CardDescription>

        {hasActions && (
          <CardAction>
            {onEdit && (
              <Button
                size="icon-sm"
                variant="outline"
                onClick={handleEditClick}
              >
                <Edit2Icon />
              </Button>
            )}

            {onDelete && (
              <Button
                size="icon-sm"
                variant="destructive"
                onClick={handleDeleteClick}
              >
                <Trash2Icon />
              </Button>
            )}
          </CardAction>
        )}
      </CardHeader>
    </Card>
  );
};

export { BoardItem };
