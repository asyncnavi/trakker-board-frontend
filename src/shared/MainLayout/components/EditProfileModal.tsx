import { type FC, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { User as UserIcon } from "lucide-react";

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
  UpdateUserRequestSchema,
  type UpdateUserRequestFields,
  type User,
} from "@/services/user/user.types";
import { useUserMutations } from "@/services/user";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  user: User;
}

const EditProfileModal: FC<EditProfileModalProps> = ({
  open,
  onOpenChange,
  onClose,
  user,
}) => {
  const { updateUser } = useUserMutations();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateUserRequestFields>({
    resolver: zodResolver(UpdateUserRequestSchema),
    defaultValues: {
      name: user.name || "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: user.name || "",
      });
    }
  }, [open, user, reset]);

  const handleFormSubmit = (values: UpdateUserRequestFields) => {
    if (!isDirty) {
      toast.info("No changes to save");
      onClose();
      return;
    }

    updateUser.mutate(values, {
      onSuccess: () => {
        toast.success("Profile updated successfully");
        reset(values);
        onClose();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update profile");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Edit Profile
            </DialogTitle>
            <DialogDescription>
              Update your profile information. Your email cannot be changed.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 my-4">
            {/* Email (Read-only) */}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                value={user.email}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your email address cannot be changed
              </p>
            </Field>

            {/* Name */}
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter your name"
              />
              {errors.name && (
                <FieldError className="text-red-400">
                  {errors.name.message}
                </FieldError>
              )}
            </Field>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={updateUser.isPending || !isDirty}>
              {updateUser.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { EditProfileModal };
