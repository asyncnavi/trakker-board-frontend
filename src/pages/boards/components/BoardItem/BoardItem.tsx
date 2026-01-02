import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Board } from "@/store";
import { Edit2Icon, Trash2Icon } from "lucide-react";
import { useCallback, type FC, type MouseEventHandler } from "react";

type BoardItemProps = {
  board: Board;
  actions?: {
    delete?: () => void;
    edit?: () => void;
    view?: () => void;
  };
};

const BoardItem: FC<BoardItemProps> = ({ board, actions }) => {
  const viewAction: MouseEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      event?.stopPropagation();

      if (actions?.view) {
        actions?.view();
      } else {
        return;
      }
    },
    [actions],
  );

  const deleteAction: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      event?.stopPropagation();

      if (actions?.delete) {
        actions?.delete();
      } else {
        return;
      }
    },
    [actions],
  );

  const editAction: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      event.stopPropagation();

      if (actions?.edit) {
        actions?.edit();
      } else {
        return;
      }
    },
    [actions],
  );

  return (
    <Card className="cursor-pointer" onClick={viewAction}>
      <CardHeader>
        <CardTitle>{board.name}</CardTitle>
        <CardDescription>{board.description}</CardDescription>

        {actions && (
          <CardAction>
            {actions.edit && (
              <Button size="icon-sm" variant="outline" onClick={editAction}>
                <Edit2Icon />
              </Button>
            )}

            {actions.delete && (
              <Button
                size="icon-sm"
                variant="destructive"
                onClick={deleteAction}
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

export default BoardItem;
