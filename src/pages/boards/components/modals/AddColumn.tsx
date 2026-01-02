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
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import useBoardStore, { type Column } from "@/store";
import { type FC, useEffect } from "react";
import clsx from "clsx";
import { Check } from "lucide-react";

const COLUMN_COLORS = [
  { name: "Gray", value: "gray", class: "bg-gray-100" },
  { name: "Red", value: "red", class: "bg-red-100" },
  { name: "Orange", value: "orange", class: "bg-orange-100" },
  { name: "Amber", value: "amber", class: "bg-amber-100" },
  { name: "Yellow", value: "yellow", class: "bg-yellow-100" },
  { name: "Lime", value: "lime", class: "bg-lime-100" },
  { name: "Green", value: "green", class: "bg-green-100" },
  { name: "Teal", value: "teal", class: "bg-teal-100" },
  { name: "Blue", value: "blue", class: "bg-blue-100" },
  { name: "Purple", value: "purple", class: "bg-purple-100" },
] as const;

const formSchema = z.object({
  name: z.string().nonempty("Name is required").max(255, "Name is too long"),
  color: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type AddColumnProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  boardId: string;
  column?: Column | null;
};

const AddColumn: FC<AddColumnProps> = ({
  open,
  onOpenChange,
  onClose,
  boardId,
  column,
}) => {
  const createColumn = useBoardStore((state) => state.createColumn);
  const updateColumn = useBoardStore((state) => state.updateColumn);
  const columns = useBoardStore((state) => state.columns);

  const isEditing = !!column;

  const { register, handleSubmit, formState, reset, control, watch } =
    useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        name: "",
        color: "",
      },
    });

  const selectedColor = watch("color");

  useEffect(() => {
    if (open && column) {
      reset({
        name: column.name || "",
        color: column.color || "",
      });
    } else if (open && !column) {
      reset({
        name: "",
        color: "",
      });
    }
  }, [open, column, reset]);

  const handleFormSubmit = (values: FormValues) => {
    if (isEditing && column) {
      updateColumn(column.id, {
        name: values.name,
        color: values.color || null,
      });
    } else {
      const boardColumns = columns.filter((c) => c.boardId === boardId);
      const maxPosition = boardColumns.reduce(
        (max, c) => Math.max(max, c.position),
        -1,
      );

      createColumn({
        id: crypto.randomUUID(),
        boardId,
        name: values.name,
        color: values.color || null,
        position: maxPosition + 1,
      });
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Column" : "Add New Column"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the column details below."
                : "Create a new column for your board."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 my-4">
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input {...register("name")} placeholder="Column name" />
              {formState.errors.name && (
                <FieldError className="text-red-400">
                  {formState.errors.name?.message}
                </FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel>Color (optional)</FieldLabel>
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {COLUMN_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() =>
                          field.onChange(
                            field.value === color.value ? "" : color.value,
                          )
                        }
                        className={clsx(
                          "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                          color.class,
                          selectedColor === color.value
                            ? "border-gray-800 scale-110"
                            : "border-transparent hover:border-gray-400",
                        )}
                        title={color.name}
                      >
                        {selectedColor === color.value && (
                          <Check className="w-4 h-4 text-gray-800" />
                        )}
                      </button>
                    ))}
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
            <Button type="submit">
              {isEditing ? "Save Changes" : "Add Column"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddColumn;
