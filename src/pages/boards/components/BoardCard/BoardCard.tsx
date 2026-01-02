import { Button } from "@/components/ui/button";
import {
  Card as CardContainer,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Card, Column } from "@/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, GripVertical, Calendar, Flag } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import clsx from "clsx";

const PRIORITY_CONFIG = {
  low: { label: "Low", color: "bg-green-100 text-green-800" },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  high: { label: "High", color: "bg-red-100 text-red-800" },
} as const;

type BoardCardActions = {
  move?: (cardId: string, toColumnId: string) => void;
  delete?: (cardId: string) => void;
  view?: (cardId: string) => void;
};

type BoardCardProps = {
  card: Card;
  columnName: string | null;
  otherColumns: Column[];
  actions?: BoardCardActions;
  isDragging?: boolean;
};

const formatDueDate = (dateString: string | null): string | null => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const isDueSoon = (dateString: string | null): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 3 && diffDays >= 0;
};

const isOverdue = (dateString: string | null): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

const BoardCard = ({
  card,
  columnName,
  otherColumns,
  actions,
  isDragging = false,
}: BoardCardProps) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: card.id,
  });

  const handleCardClick = () => {
    actions?.view?.(card.id);
  };

  const handleMoveCard = (
    event: React.MouseEvent,
    cardId: string,
    toColumnId: string,
  ) => {
    event.stopPropagation();
    actions?.move?.(cardId, toColumnId);
  };

  const handleDeleteCard = (event: React.MouseEvent) => {
    event.stopPropagation();
    actions?.delete?.(card.id);
  };

  const formattedDueDate = formatDueDate(card.dueDate);
  const dueSoon = isDueSoon(card.dueDate);
  const overdue = isOverdue(card.dueDate);

  return (
    <CardContainer
      ref={setNodeRef}
      onClick={handleCardClick}
      className={clsx(
        "hover:bg-blue-50 cursor-pointer transition-colors relative",
        isDragging && "bg-gray-200 border-dashed opacity-50",
      )}
    >
      <CardHeader className="pb-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 absolute top-0 left-0"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-sm font-medium">{card.name}</CardTitle>
          <CardDescription className="text-xs">
            {card.description
              ? `${card.description.length > 20 ? `${card.description.substring(0, 30)}...` : card.description}`
              : `#${columnName}`}
          </CardDescription>
        </div>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={(e) => e.stopPropagation()}
              >
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Move to</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      {otherColumns.map((targetColumn) => {
                        return (
                          <DropdownMenuItem
                            key={targetColumn.id}
                            onClick={(event) => {
                              handleMoveCard(event, card.id, targetColumn.id);
                            }}
                          >
                            {targetColumn.name}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuGroup>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteCard}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>

      {(card.priority || formattedDueDate || card.tags.length > 0) && (
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-center gap-2">
            {card.priority && (
              <span
                className={clsx(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                  PRIORITY_CONFIG[card.priority].color,
                )}
              >
                <Flag className="w-3 h-3" />
                {PRIORITY_CONFIG[card.priority].label}
              </span>
            )}

            {formattedDueDate && (
              <span
                className={clsx(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                  overdue
                    ? "bg-red-100 text-red-800"
                    : dueSoon
                      ? "bg-orange-100 text-orange-800"
                      : "bg-gray-100 text-gray-800",
                )}
              >
                <Calendar className="w-3 h-3" />
                {formattedDueDate}
              </span>
            )}
          </div>

          {card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </CardContainer>
  );
};

export default BoardCard;
