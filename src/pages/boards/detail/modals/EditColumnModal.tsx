import { type FC, useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check, ChevronsUpDown, Trash2Icon } from "lucide-react";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  UpdateColumnRequestSchema,
  useColumnMutations,
  type UpdateColumnRequestFields,
} from "@/services/column";
import type { BoardColumn } from "@/services/board";
import { getDirtyFields } from "@/lib/form-utils";

import { COLUMN_COLORS } from "../../constants";

interface EditColumnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  boardId: string;
  column: BoardColumn;
}

const EditColumnModal: FC<EditColumnModalProps> = ({
  open,
  onOpenChange,
  onClose,
  boardId,
  column,
}) => {
  const { updateColumn, deleteColumn } = useColumnMutations(boardId);

  const { register, handleSubmit, formState, reset, control, watch } =
    useForm<UpdateColumnRequestFields>({
      resolver: zodResolver(UpdateColumnRequestSchema),
      defaultValues: {
        name: "",
        background_color: null,
      },
    });

  const selectedColor = watch("background_color");
  const isPending = updateColumn.isPending || deleteColumn.isPending;

  useEffect(() => {
    if (!open || !column) return;

    reset({
      name: column.name || "",
      background_color: column.background_color || null,
    });
  }, [open, column, reset]);

  const handleFormSubmit = useCallback(
    async (values: UpdateColumnRequestFields) => {
      try {
        const dirtyData = getDirtyFields<UpdateColumnRequestFields>(
          formState.dirtyFields,
          values,
        );

        if (Object.keys(dirtyData).length > 0) {
          await updateColumn.mutateAsync({
            id: column.id,
            data: dirtyData,
          });
          toast.success("Column updated successfully");
        } else {
          toast.info("No changes to save");
        }

        onClose();
      } catch (error) {
        toast.error("Failed to update column");
        console.error("Failed to update column:", error);
      }
    },
    [column.id, formState.dirtyFields, updateColumn, onClose],
  );

  const handleDeleteColumn = useCallback(async () => {
    if (!column) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${column.name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await deleteColumn.mutateAsync(column.id);
      toast.success("Column deleted successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to delete column");
      console.error("Failed to delete column:", error);
    }
  }, [column, deleteColumn, onClose]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Column</DialogTitle>
            <DialogDescription>
              Update the column details below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 my-4">
            {/* Actions Section */}
            <Collapsible>
              <CollapsibleTrigger className="w-full">
                <div className="flex justify-end items-center gap-2 py-2 ml-auto cursor-pointer text-sm">
                  <ChevronsUpDown size={18} />
                  Actions
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <button
                  type="button"
                  onClick={handleDeleteColumn}
                  disabled={isPending}
                  className="flex w-full justify-between items-center py-2 px-3 text-destructive bg-destructive/10 hover:bg-destructive/20 rounded cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete Column
                  <Trash2Icon size={18} />
                </button>
              </CollapsibleContent>
            </Collapsible>

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
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { EditColumnModal };
