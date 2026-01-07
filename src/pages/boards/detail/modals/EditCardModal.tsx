import { type FC, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Tag } from "lucide-react";

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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { MultiSelectInput } from "@/components/ui/multi-select-input";
import MDEditor from "@uiw/react-md-editor";

import {
  UpdateCardRequestSchema,
  useCardMutations,
  useCardQuery,
  type Card,
  type UpdateCardRequestFields,
} from "@/services/card";
import { useParams } from "react-router";
import { getDirtyFields } from "@/lib/form-utils";

import { CARD_LABELS } from "../../constants";

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Converts UTC timestamp to YYYY-MM-DD format for date input
 */
const formatDateForInput = (utcTimestamp: string | null): string => {
  if (!utcTimestamp) return "";

  try {
    const date = new Date(utcTimestamp);
    // Format as YYYY-MM-DD (required by HTML5 date input)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

/**
 * Converts YYYY-MM-DD format to UTC timestamp
 */
const formatDateToUTC = (dateString: string | null): string | null => {
  if (!dateString || dateString === "") return null;

  try {
    // Parse the YYYY-MM-DD string and convert to UTC timestamp
    const date = new Date(dateString + "T00:00:00.000Z");
    return date.toISOString();
  } catch (error) {
    console.error("Error converting date to UTC:", error);
    return null;
  }
};

const populateDefaultValue = (card: Card): UpdateCardRequestFields => {
  return {
    title: card.title ?? "",
    description: card.description ?? "",
    position: Number(card.position) || 0,
    due_date: formatDateForInput(card.due_date),
    labels: Array.isArray(card.labels)
      ? card.labels
      : card.labels
        ? [card.labels]
        : [],
    checklist: card.checklist,
    attachments: card.attachments,
  };
};

interface EditCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  cardId: string;
  columnId: string;
}

const EditCardModal: FC<EditCardModalProps> = ({
  open,
  onOpenChange,
  onClose,
  cardId,
  columnId,
}) => {
  const { boardId } = useParams<{ boardId: string }>();

  const { data: card } = useCardQuery(cardId);
  const { updateCard } = useCardMutations(boardId as string, columnId);

  const { register, handleSubmit, formState, reset, setValue, watch, control } =
    useForm<UpdateCardRequestFields>({
      resolver: zodResolver(UpdateCardRequestSchema),
      defaultValues: {
        title: "",
        description: "",
        position: 0,
        due_date: "",
        labels: [],
        checklist: null,
        attachments: null,
      },
    });

  useEffect(() => {
    if (!open || !card) return;

    reset(populateDefaultValue(card));
  }, [open, card, reset]);

  useEffect(() => {
    if (formState.errors) {
      console.log(formState.errors);
    }
  }, [formState.errors]);

  const handleFormSubmit = async (values: UpdateCardRequestFields) => {
    if (!cardId) return;

    const dirtyData = getDirtyFields<UpdateCardRequestFields>(
      formState.dirtyFields,
      values,
    );

    // Convert due_date from YYYY-MM-DD to UTC timestamp if it's dirty
    if (dirtyData.due_date !== undefined) {
      dirtyData.due_date = formatDateToUTC(
        typeof dirtyData.due_date === "string" ? dirtyData.due_date : null,
      );
    }

    try {
      await updateCard.mutateAsync({
        id: cardId,
        data: dirtyData,
      });

      onClose();
    } catch (error) {
      console.error("Failed to update card:", error);
    }
  };

  // ---------------------------------------------------------------------------
  // Render: Guard
  // ---------------------------------------------------------------------------

  if (!card) {
    return null;
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 my-4">
            {/* Card Title */}
            <Field>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                {...register("title")}
                placeholder="Card title"
              />
              {formState.errors.title && (
                <FieldError className="text-red-400">
                  {formState.errors.title.message}
                </FieldError>
              )}
            </Field>

            {/* Card Description */}
            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <div data-color-mode="light">
                <MDEditor
                  value={watch("description") ?? ""}
                  onChange={(value) => {
                    setValue("description", value ?? "", {
                      shouldDirty: true,
                    });
                  }}
                  preview="edit"
                  height={200}
                />
              </div>
            </Field>

            {/* Labels */}
            <Field>
              <FieldLabel htmlFor="labels" className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Labels
              </FieldLabel>
              <Controller
                name="labels"
                control={control}
                render={({ field }) => (
                  <MultiSelectInput
                    value={
                      Array.isArray(field.value)
                        ? field.value
                        : field.value
                          ? [field.value]
                          : []
                    }
                    onChange={field.onChange}
                    placeholder="Add labels..."
                    allowCustom={true}
                    predefinedOptions={CARD_LABELS}
                    variant="badge"
                    maxItems={10}
                  />
                )}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Select from predefined labels or create your own
              </p>
            </Field>

            {/* Due Date */}
            <Field>
              <FieldLabel
                htmlFor="due_date"
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Due Date
              </FieldLabel>
              <Input
                id="due_date"
                type="date"
                {...register("due_date")}
                className="w-full"
              />
            </Field>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={updateCard.isPending}>
              {updateCard.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { EditCardModal };
