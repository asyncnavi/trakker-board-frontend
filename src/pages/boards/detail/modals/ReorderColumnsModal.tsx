import { type FC, useState, useEffect } from "react";
import { toast } from "sonner";
import { GripVertical, ArrowUpDown } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useColumnMutations } from "@/services/column";
import type { ColumnWithCards } from "@/services/column/column.types";

interface ReorderColumnsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  boardId: string;
  columns: ColumnWithCards[];
}

interface SortableColumnItemProps {
  column: ColumnWithCards;
  index: number;
}

const SortableColumnItem: FC<SortableColumnItemProps> = ({ column, index }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
    >
      <button
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{column.name}</span>
          <span className="text-xs text-gray-500">
            ({column.cards?.length || 0} cards)
          </span>
        </div>
      </div>
      <div className="text-sm text-gray-500">Position: {index + 1}</div>
    </div>
  );
};

const ReorderColumnsModal: FC<ReorderColumnsModalProps> = ({
  open,
  onOpenChange,
  onClose,
  boardId,
  columns,
}) => {
  const [localColumns, setLocalColumns] = useState<ColumnWithCards[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const { reorderColumns } = useColumnMutations(boardId);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Initialize local state when modal opens or columns prop changes.
  // This is intentional synchronization with external props - not a performance issue.
  useEffect(() => {
    if (open) {
      const sortedColumns = [...columns].sort(
        (a, b) => a.position - b.position,
      );
      setLocalColumns(sortedColumns);
      setHasChanges(false);
    }
  }, [open, columns]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalColumns((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const reordered = arrayMove(items, oldIndex, newIndex);
        setHasChanges(true);
        return reordered;
      });
    }
  };

  const handleSave = () => {
    // Build the column_orders payload with new positions
    const column_orders = localColumns.map((col, index) => ({
      id: col.id,
      position: index,
    }));

    reorderColumns.mutate(
      { column_orders },
      {
        onSuccess: () => {
          toast.success("Columns reordered successfully");
          setHasChanges(false);
          onClose();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to reorder columns");
        },
      },
    );
  };

  const handleReset = () => {
    const sortedColumns = [...columns].sort((a, b) => a.position - b.position);
    setLocalColumns(sortedColumns);
    setHasChanges(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5" />
            Reorder Columns
          </DialogTitle>
          <DialogDescription>
            Drag and drop columns to change their order on the board.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-2 min-h-[300px]">
          {localColumns.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              No columns to reorder
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={localColumns.map((col) => col.id)}
                strategy={verticalListSortingStrategy}
              >
                {localColumns.map((column, index) => (
                  <SortableColumnItem
                    key={column.id}
                    column={column}
                    index={index}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center">
          <Button
            variant="outline"
            type="button"
            onClick={handleReset}
            disabled={!hasChanges || reorderColumns.isPending}
          >
            Reset
          </Button>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || reorderColumns.isPending}
            >
              {reorderColumns.isPending ? "Saving..." : "Save Order"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { ReorderColumnsModal };
