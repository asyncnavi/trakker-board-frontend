import { AuthLayout } from "@/components/AuthLayout";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  StartLoginRequestSchema,
  type StartLoginRequestFields,
} from "@/services/auth";
import useAuthStore from "@/store/auth";
import { useNavigate, useLocation } from "react-router";
import { toast } from "sonner";

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const navigate = useNavigate();
  const location = useLocation();
  const { startLogin, isLoading, error } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StartLoginRequestFields>({
    resolver: zodResolver(StartLoginRequestSchema),
  });

  const onSubmit = async (data: StartLoginRequestFields) => {
    const success = await startLogin(data.email);

    if (success) {
      toast.success(`OTP has been sent to ${data.email}`);
      navigate("/verify", {
        state: {
          email: data.email,
          from: location.state?.from,
        },
      });
    } else {
      toast.error(error || "Failed to send OTP");
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email. New here? We’ll create your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </Field>
        <Field>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Continue"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
