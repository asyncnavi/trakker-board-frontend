import { type FC, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check } from "lucide-react";
import clsx from "clsx";

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
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  CreateColumnRequestSchema,
  useColumnMutations,
  type CreateColumnRequestFields,
} from "@/services/column";
import { useBoardQuery } from "@/services/board";

import { COLUMN_COLORS } from "../../constants";

// =============================================================================
// Types
// =============================================================================

interface CreateColumnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  boardId: string;
}

// =============================================================================
// Component
// =============================================================================

const CreateColumnModal: FC<CreateColumnModalProps> = ({
  open,
  onOpenChange,
  onClose,
  boardId,
}) => {
  // ---------------------------------------------------------------------------
  // Queries & Mutations
  // ---------------------------------------------------------------------------

  const { data: board } = useBoardQuery(boardId);
  const { createColumn } = useColumnMutations(boardId);

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  const { register, handleSubmit, formState, control, watch } =
    useForm<CreateColumnRequestFields>({
      resolver: zodResolver(CreateColumnRequestSchema),
      defaultValues: {
        name: "",
        position: 0,
        background_color: null,
      },
    });

  const selectedColor = watch("background_color");
  const isPending = createColumn.isPending;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleFormSubmit = useCallback(
    async (values: CreateColumnRequestFields) => {
      try {
        const position = board?.columns?.length ?? 0;
        await createColumn.mutateAsync({
          name: values.name,
          position,
          background_color: values.background_color || null,
        });
        toast.success("Column created successfully");
        onClose();
      } catch (error) {
        toast.error("Failed to create column");
        console.error("Failed to create column:", error);
      }
    },
    [board?.columns?.length, createColumn, onClose],
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogHeader>
            <DialogTitle>Create New Column</DialogTitle>
            <DialogDescription>
              Add a new column to organize your cards.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 my-4">
            {/* Column Name */}
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                {...register("name")}
                placeholder="Column name"
              />
              {formState.errors.name && (
                <FieldError className="text-red-400">
                  {formState.errors.name.message}
                </FieldError>
              )}
            </Field>

            {/* Column Color */}
            <Field>
              <FieldLabel>Color (optional)</FieldLabel>
              <Controller
                name="background_color"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {COLUMN_COLORS.map((color) => {
                      const isSelected = selectedColor === color.value;

                      return (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() =>
                            field.onChange(isSelected ? null : color.value)
                          }
                          className={clsx(
                            "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                            color.className,
                            isSelected
                              ? "border-gray-800 scale-110"
                              : "border-transparent hover:border-gray-400",
                          )}
                          title={color.name}
                          aria-label={`Select ${color.name} color`}
                        >
                          {isSelected && (
                            <Check className="w-4 h-4 text-gray-800" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </Field>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Column"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { CreateColumnModal };
