import { AuthLayout } from "@/components/AuthLayout";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  VerifyLoginRequestSchema,
  type VerifyLoginRequestFields,
} from "@/services/auth";
import useAuthStore from "@/store/auth";
import { useNavigate, useLocation } from "react-router";
import { useEffect } from "react";
import { toast } from "sonner";

export default function VerifyPage() {
  return (
    <AuthLayout>
      <VerifyLoginForm />
    </AuthLayout>
  );
}

export function VerifyLoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const { verifyLogin, isLoading, error, isAuthenticated } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyLoginRequestFields>({
    resolver: zodResolver(VerifyLoginRequestSchema),
    defaultValues: {
      email: email || "",
    },
  });

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  // Redirect to intended location after successful verification
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const onSubmit = async (data: VerifyLoginRequestFields) => {
    const success = await verifyLogin(data.email, data.otp);

    if (success) {
      toast.success("Login successful!");
      // Navigation handled by useEffect when isAuthenticated changes
    } else {
      toast.error(error || "Failed to verify OTP");
    }
  };

  const handleResendOTP = () => {
    // Navigate back to login to resend
    navigate("/login");
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Verify your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter the OTP sent to {email}
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            {...register("email")}
            disabled
            className="bg-muted"
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="otp">OTP</FieldLabel>
          <Input
            id="otp"
            type="text"
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            {...register("otp")}
            autoFocus
          />
          {errors.otp && (
            <p className="text-sm text-red-500">{errors.otp.message}</p>
          )}
        </Field>
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        <Field>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
        </Field>
        <div className="text-center text-sm">
          <span className="text-muted-foreground">
            Didn't receive the code?{" "}
          </span>
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto"
            onClick={handleResendOTP}
          >
            Resend OTP
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
