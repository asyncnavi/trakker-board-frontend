import { useCallback, type MouseEvent } from "react";
import { useDraggable } from "@dnd-kit/core";
import { ChevronDown, GripVertical, Calendar, Tag } from "lucide-react";
import clsx from "clsx";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import type {
  BoardCard as CardType,
  BoardColumn as ColumnType,
} from "@/services/board";
import { CARD_LABELS } from "../../constants";

interface BoardCardProps {
  card: CardType;
  columnName: string | null;
  otherColumns: ColumnType[];
  isDragging?: boolean;
  onMove?: (cardId: string, toColumnId: string) => void;
  onDelete?: (cardId: string) => void;
  onView?: (cardId: string) => void;
}

function formatDueDate(dateString: string | null): string | null {
  if (!dateString) return null;

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isDueSoon(dateString: string | null): boolean {
  if (!dateString) return false;

  const date = new Date(dateString);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays <= 3 && diffDays >= 0;
}

function isOverdue(dateString: string | null): boolean {
  if (!dateString) return false;

  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date < today;
}

function getDueDateClassName(dateString: string | null): string {
  if (isOverdue(dateString)) {
    return "bg-red-100 text-red-800";
  }
  if (isDueSoon(dateString)) {
    return "bg-orange-100 text-orange-800";
  }
  return "bg-gray-100 text-gray-800";
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

// Color mapping for labels (Tailwind classes)
const LABEL_COLOR_MAP: Record<string, string> = {
  red: "bg-red-100 text-red-800",
  blue: "bg-blue-100 text-blue-800",
  green: "bg-green-100 text-green-800",
  yellow: "bg-yellow-100 text-yellow-800",
  purple: "bg-purple-100 text-purple-800",
  pink: "bg-pink-100 text-pink-800",
  indigo: "bg-indigo-100 text-indigo-800",
  orange: "bg-orange-100 text-orange-800",
  gray: "bg-gray-100 text-gray-800",
};

function getLabelDisplay(labelValue: string): { label: string; color: string } {
  const predefined = CARD_LABELS.find((l) => l.value === labelValue);
  if (predefined && predefined.color) {
    const colorKey = predefined.color as keyof typeof LABEL_COLOR_MAP;
    const color = LABEL_COLOR_MAP[colorKey];
    return {
      label: predefined.label,
      color: color || LABEL_COLOR_MAP.gray,
    };
  }
  // Custom label
  return {
    label: labelValue,
    color: LABEL_COLOR_MAP.gray,
  };
}

function BoardCard({
  card,
  columnName,
  otherColumns,
  isDragging = false,
  onMove,
  onDelete,
  onView,
}: BoardCardProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: card.id,
  });
  const handleCardClick = useCallback(() => {
    onView?.(card.id);
  }, [onView, card.id]);

  const handleMoveCard = useCallback(
    (event: MouseEvent, toColumnId: string) => {
      event.stopPropagation();
      onMove?.(card.id, toColumnId);
    },
    [onMove, card.id],
  );

  const handleDeleteCard = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      onDelete?.(card.id);
    },
    [onDelete, card.id],
  );

  const stopPropagation = useCallback((event: MouseEvent) => {
    event.stopPropagation();
  }, []);

  const formattedDueDate = formatDueDate(card.due_date);
  const dueDateClassName = getDueDateClassName(card.due_date);

  const cardDescription = card.description
    ? truncateText(card.description, 30)
    : `#${columnName}`;

  // Parse labels - handle string format (comma-separated or JSON array)
  const labels: string[] = (() => {
    if (!card.labels) return [];
    if (typeof card.labels === "string") {
      // Try to parse as JSON array first
      try {
        const parsed = JSON.parse(card.labels);
        return Array.isArray(parsed) ? parsed : [card.labels];
      } catch {
        // If not JSON, split by comma
        return card.labels.includes(",")
          ? card.labels.split(",").map((l) => l.trim())
          : [card.labels];
      }
    }
    return [];
  })();

  return (
    <Card
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
          <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
          <CardDescription className="text-xs">
            {cardDescription}
          </CardDescription>
        </div>

        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon-sm" variant="ghost" onClick={stopPropagation}>
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="start">
              {/* Move To Sub-menu */}
              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Move to</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      {otherColumns.map((targetColumn) => (
                        <DropdownMenuItem
                          key={targetColumn.id}
                          onClick={(event) =>
                            handleMoveCard(event, targetColumn.id)
                          }
                        >
                          {targetColumn.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuGroup>

              <DropdownMenuItem onClick={stopPropagation}>
                Edit
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleDeleteCard}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>

      {/* Labels and Due Date */}
      {(labels.length > 0 || formattedDueDate) && (
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-center gap-2">
            {/* Labels */}
            {labels.length > 0 && (
              <>
                {labels.slice(0, 3).map((labelValue, index) => {
                  const { label, color } = getLabelDisplay(labelValue);
                  return (
                    <span
                      key={`${labelValue}-${index}`}
                      className={clsx(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                        color,
                      )}
                    >
                      <Tag className="w-3 h-3" />
                      {label}
                    </span>
                  );
                })}
                {labels.length > 3 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    +{labels.length - 3} more
                  </span>
                )}
              </>
            )}

            {/* Due Date Badge */}
            {formattedDueDate && (
              <span
                className={clsx(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                  dueDateClassName,
                )}
              >
                <Calendar className="w-3 h-3" />
                {formattedDueDate}
              </span>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export { BoardCard };
