import { type FC, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Image as ImageIcon,
  Archive,
  ArchiveRestore,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router";

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import {
  UpdateBoardRequestSchema,
  useBoardMutations,
  type UpdateBoardRequestFields,
  type FullBoard,
} from "@/services/board";
import { BOARD_BACKGROUNDS } from "../../constants";
import clsx from "clsx";

interface EditBoardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  board: FullBoard;
}

const EditBoardModal: FC<EditBoardModalProps> = ({
  open,
  onOpenChange,
  onClose,
  board,
}) => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  const { updateBoard, deleteBoard, archiveBoard, unarchiveBoard } =
    useBoardMutations();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    control,
    watch,
  } = useForm<UpdateBoardRequestFields>({
    resolver: zodResolver(UpdateBoardRequestSchema),
    defaultValues: {
      name: board.name || "",
      description: board.description || "",
      background_url: board.background_url || "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: board.name || "",
        description: board.description || "",
        background_url: board.background_url || "",
      });
    }
  }, [open, board, reset]);

  useEffect(() => {
    if (errors) {
      console.log(errors);
    }
  }, [errors]);

  const selectedBackground = watch("background_url");

  const handleFormSubmit = (values: UpdateBoardRequestFields) => {
    if (!isDirty) {
      toast.info("No changes to save");
      onClose();
      return;
    }

    // Convert empty string to null for background_url
    const dataToSubmit = {
      ...values,
      background_url:
        values.background_url === "" ? null : values.background_url,
    };

    updateBoard.mutate(
      { id: board.id, data: dataToSubmit },
      {
        onSuccess: () => {
          toast.success("Board updated successfully");
          reset(values);
          onClose();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update board");
        },
      },
    );
  };

  const handleDelete = () => {
    deleteBoard.mutate(board.id, {
      onSuccess: () => {
        toast.success("Board deleted successfully");
        onClose();
        navigate("/boards");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete board");
      },
    });
  };

  const handleArchive = () => {
    archiveBoard.mutate(board.id, {
      onSuccess: () => {
        toast.success("Board archived successfully");
        setShowArchiveConfirm(false);
        onClose();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to archive board");
      },
    });
  };

  const handleUnarchive = () => {
    unarchiveBoard.mutate(board.id, {
      onSuccess: () => {
        toast.success("Board unarchived successfully");
        setShowArchiveConfirm(false);
        onClose();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to unarchive board");
      },
    });
  };

  const isArchived = !!board.archived_at;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit Board</DialogTitle>
              <DialogDescription>
                Update board details, change background image, or manage board
                status.
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

              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Enter board description (optional)"
                  rows={3}
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
                  Background Image
                </FieldLabel>
                <Controller
                  name="background_url"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-3">
                      {/* Background thumbnail grid */}
                      <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto p-1">
                        {BOARD_BACKGROUNDS.map((bg) => (
                          <button
                            key={bg.id}
                            type="button"
                            onClick={() =>
                              field.onChange(bg.url === null ? "" : bg.url)
                            }
                            className={clsx(
                              "relative h-16 rounded-md overflow-hidden border-2 transition-all hover:scale-105",
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
                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                  <svg
                                    className="w-4 h-4 text-white"
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
                <p className="text-xs text-muted-foreground mt-2">
                  Choose a background image for your board. Images from
                  Unsplash.
                </p>
              </Field>
            </div>

            <Separator className="my-4" />

            {/* Danger Zone */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Board Actions
              </h3>

              {/* Archive/Unarchive Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowArchiveConfirm(true)}
                disabled={archiveBoard.isPending || unarchiveBoard.isPending}
              >
                {isArchived ? (
                  <>
                    <ArchiveRestore className="w-4 h-4 mr-2" />
                    Unarchive Board
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4 mr-2" />
                    Archive Board
                  </>
                )}
              </Button>

              {/* Delete Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleteBoard.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Board
              </Button>
            </div>

            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={updateBoard.isPending || !isDirty}
              >
                {updateBoard.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Board?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              board "{board.name}" and all its columns and cards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteBoard.isPending}
            >
              {deleteBoard.isPending ? "Deleting..." : "Delete Board"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive/Unarchive Confirmation Dialog */}
      <AlertDialog
        open={showArchiveConfirm}
        onOpenChange={setShowArchiveConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isArchived ? "Unarchive" : "Archive"} Board?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isArchived
                ? `This will restore the board "${board.name}" and make it visible in your board list.`
                : `This will archive the board "${board.name}" and hide it from your board list. You can unarchive it later.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={isArchived ? handleUnarchive : handleArchive}
              disabled={archiveBoard.isPending || unarchiveBoard.isPending}
            >
              {archiveBoard.isPending || unarchiveBoard.isPending
                ? "Processing..."
                : isArchived
                  ? "Unarchive Board"
                  : "Archive Board"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export { EditBoardModal };
