import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import useBoardStore from "@/store";
import { type FC, useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import clsx from "clsx";
import { X, Plus, Calendar, Flag } from "lucide-react";

const PRIORITIES = [
  { value: "low", label: "Low", color: "bg-green-100 text-green-800" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "High", color: "bg-red-100 text-red-800" },
] as const;

const formSchema = z.object({
  name: z.string().nonempty("Name is required").max(255, "Name is too long"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).nullable().optional(),
  dueDate: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ViewBoardCardProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  cardId: string;
};

const ViewBoardCard: FC<ViewBoardCardProps> = ({
  open,
  onOpenChange,
  onClose,
  cardId,
}) => {
  const card = useBoardStore(
    useShallow((state) => state.cards.find((c) => c.id === cardId)),
  );
  const updateCard = useBoardStore((state) => state.updateCard);

  const [newTag, setNewTag] = useState("");

  const { register, handleSubmit, formState, reset, control, watch, setValue } =
    useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        name: "",
        description: "",
        priority: null,
        dueDate: null,
        tags: [],
      },
    });

  const watchedTags = watch("tags") || [];
  const watchedPriority = watch("priority");

  useEffect(() => {
    if (open && card) {
      reset({
        name: card.name || "",
        description: card.description || "",
        priority: card.priority,
        dueDate: card.dueDate || "",
        tags: card.tags || [],
      });
    }
  }, [open, card, reset]);

  const handleFormSubmit = (values: FormValues) => {
    if (!cardId) return;

    updateCard(cardId, {
      name: values.name,
      description: values.description || null,
      priority: values.priority || null,
      dueDate: values.dueDate || null,
      tags: values.tags || [],
    });

    onClose();
  };

  const handleAddTag = () => {
    if (newTag.trim() && !watchedTags.includes(newTag.trim())) {
      setValue("tags", [...watchedTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      "tags",
      watchedTags.filter((tag) => tag !== tagToRemove),
    );
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (!card) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 my-4">
            {/* Name */}
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input {...register("name")} placeholder="Card name" />
              {formState.errors.name && (
                <FieldError className="text-red-400">
                  {formState.errors.name?.message}
                </FieldError>
              )}
            </Field>

            {/* Description */}
            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                {...register("description")}
                placeholder="Add a description..."
                rows={3}
              />
            </Field>

            {/* Priority */}
            <Field>
              <FieldLabel className="flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Priority
              </FieldLabel>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <div className="flex gap-2 mt-2">
                    {PRIORITIES.map((priority) => (
                      <button
                        key={priority.value}
                        type="button"
                        onClick={() =>
                          field.onChange(
                            field.value === priority.value
                              ? null
                              : priority.value,
                          )
                        }
                        className={clsx(
                          "px-3 py-1 rounded-full text-sm font-medium transition-all border-2",
                          priority.color,
                          watchedPriority === priority.value
                            ? "border-gray-800 scale-105"
                            : "border-transparent hover:border-gray-400",
                        )}
                      >
                        {priority.label}
                      </button>
                    ))}
                  </div>
                )}
              />
            </Field>

            {/* Due Date */}
            <Field>
              <FieldLabel className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due Date
              </FieldLabel>
              <Input
                {...register("dueDate")}
                type="date"
                className="w-full mt-1"
              />
            </Field>

            {/* Tags */}
            <Field>
              <FieldLabel>Tags</FieldLabel>
              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {watchedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Add a tag..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTag}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </Field>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ViewBoardCard;
