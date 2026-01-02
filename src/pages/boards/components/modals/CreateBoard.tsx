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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import useBoardStore from "@/store";
import type { FC } from "react";
const formSchema = z.object({
  name: z.string().nonempty("Name is required").max(255, "Name is too long"),
  description: z.string().max(512, "Description is too long").optional(),
});

type FormValues = z.infer<typeof formSchema>;

type CreateBoardModalProps = {
  open: boolean;
  onOpenChange: () => void;
  onClose: () => void;
};

const CreateBoardModal: FC<CreateBoardModalProps> = ({
  open,
  onOpenChange,
  onClose,
}) => {
  const createBoard = useBoardStore((state) => state.createBoard);

  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const handleCreateBoard = (values: FormValues) => {
    const now = new Date().toISOString();
    createBoard({
      id: crypto.randomUUID(),
      name: values.name,
      description: values.description || null,
      background: null,
      createdAt: now,
      updatedAt: now,
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form
          onSubmit={handleSubmit((values) => {
            handleCreateBoard(values);
          })}
        >
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 my-4">
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input {...register("name")} />
              {formState.errors.name && (
                <FieldError className="text-red-400">
                  {formState.errors.name?.message}
                </FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea {...register("description")} />
              {formState.errors.description && (
                <FieldError className="text-red-400">
                  {formState.errors.description?.message}
                </FieldError>
              )}
            </Field>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Create New</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBoardModal;
