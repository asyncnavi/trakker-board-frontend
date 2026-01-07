import { type FC, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Image as ImageIcon } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  CreateBoardRequestSchema,
  useBoardMutations,
  type CreateBoardRequestFields,
} from "@/services/board";
import { BOARD_BACKGROUNDS } from "../../constants";

interface CreateBoardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

const CreateBoardModal: FC<CreateBoardModalProps> = ({
  open,
  onOpenChange,
  onClose,
}) => {
  const { createBoard } = useBoardMutations();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
  } = useForm<CreateBoardRequestFields>({
    resolver: zodResolver(CreateBoardRequestSchema),
    defaultValues: {
      name: "",
      description: "",
      background_url: "",
    },
  });

  const selectedBackground = watch("background_url");

  const handleFormSubmit = useCallback(
    (values: CreateBoardRequestFields) => {
      // Normalize empty string to null for backend
      const dataToSubmit = {
        ...values,
        background_url:
          values.background_url === "" ? null : values.background_url,
      };

      createBoard.mutate(dataToSubmit, {
        onSuccess: () => {
          toast.success("Board created successfully");
          reset();
          onClose();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create board");
        },
      });
    },
    [createBoard, reset, onClose],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
            <DialogDescription>
              Create a new board to organize your tasks and projects.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 my-4">
            {/* Board Name */}
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter board name"
              />
              {errors.name && (
                <FieldError className="text-red-400">
                  {errors.name.message}
                </FieldError>
              )}
            </Field>

            {/* Board Description */}
            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Enter board description (optional)"
              />
              {errors.description && (
                <FieldError className="text-red-400">
                  {errors.description.message}
                </FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Background Image (Optional)
              </FieldLabel>
              <Controller
                name="background_url"
                control={control}
                render={({ field }) => (
                  <div className="space-y-3">
                    {selectedBackground && (
                      <div className="relative h-24 rounded-lg overflow-hidden border-2 border-gray-200">
                        <img
                          src={selectedBackground}
                          alt="Selected background"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                          <span className="text-white text-xs font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                            Selected
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
                      {BOARD_BACKGROUNDS.map((bg) => (
                        <button
                          key={bg.id}
                          type="button"
                          onClick={() =>
                            field.onChange(bg.url === null ? "" : bg.url)
                          }
                          className={clsx(
                            "relative h-14 rounded-md overflow-hidden border-2 transition-all hover:scale-105",
                            (bg.url === null &&
                              (selectedBackground === "" ||
                                selectedBackground === null)) ||
                              selectedBackground === bg.url
                              ? "border-blue-500 ring-2 ring-blue-200"
                              : "border-gray-300 hover:border-gray-400",
                          )}
                          title={bg.name}
                        >
                          {bg.thumbnail ? (
                            <img
                              src={bg.thumbnail}
                              alt={bg.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-white flex items-center justify-center">
                              <span className="text-xs text-gray-500">
                                None
                              </span>
                            </div>
                          )}
                          {((bg.url === null &&
                            (selectedBackground === "" ||
                              selectedBackground === null)) ||
                            selectedBackground === bg.url) && (
                            <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Choose a background image for your board
              </p>
            </Field>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={createBoard.isPending}>
              {createBoard.isPending ? "Creating..." : "Create Board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { CreateBoardModal };
