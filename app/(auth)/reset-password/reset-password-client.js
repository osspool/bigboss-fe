"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

import { AuthForm } from "@/components/auth/auth-form";
import { SubmitButton } from "@/components/custom/submit-button";
import { Button } from "@/components/ui/button";
import { resetPass } from "../actions";

export default function ResetPasswordClient({ token }) {
  const router = useRouter();
  const [isValid, setIsValid] = useState(false);

  const [state, formAction] = useActionState(resetPass, {
    status: "idle",
  });

  const isLoading = state.status === "in_progress";
  const isSuccess = state.status === "success";

  useEffect(() => {
    if (state.status === "failed") {
      toast.error(state.error || "Invalid or expired token");
    } else if (state.status === "invalid_data") {
      toast.error("Token is required");
    } else if (state.status === "success") {
      toast.success("Password updated successfully");
      // After 2 seconds, redirect to login
    }
  }, [state]);

  const handleSubmit = (formData) => {
    formData.append("token", token);
    formAction(formData);
  };

  return (
    <div className="animate-fade-in-up" style={{ animationDuration: '300ms' }}>
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <div className="rounded-full bg-retro-primary/10 p-3">
            <CheckCircle className="h-8 w-8 text-retro-primary" />
          </div>
          <h3 className="text-lg font-medium text-foreground">Password Updated</h3>
          <p className="text-sm text-muted-foreground text-center">
            {`Your password has been successfully updated. You'll be redirected to the login page.`}
          </p>
          <Link href="/login" className="w-full mt-2">
            <Button className="w-full retro-button retro-button-primary">
              Go to Login
            </Button>
          </Link>
        </div>
      ) : (
        <AuthForm formType="resetpass" action={handleSubmit} onValidityChange={setIsValid}>
          <SubmitButton 
            disabled={!isValid || isLoading}
            className="w-full retro-button retro-button-primary mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </SubmitButton>
          
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to login
            </Link>
          </div>
        </AuthForm>
      )}
    </div>
  );
}