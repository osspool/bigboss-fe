"use client";

import { KeyRound, LogIn, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { AuthForm } from "@/components/auth/auth-form";
import { SubmitButton } from "@/components/custom/submit-button";


import { forgetPass } from "../actions";
import AuthContainer from "@/components/auth/auth-container";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const [state, formAction] = useActionState(forgetPass, {
    status: "idle",
  });

  const isLoading = state.status === "in_progress";

  useEffect(() => {
    if (state.status === "failed") {
      toast.error(state.error || "Failed to send reset link. Please try again.");
    } else if (state.status === "invalid_data") {
      toast.error("Failed validating your submission!");
    } else if (state.status === "success") {
      toast.success("Password reset email sent successfully");
    }
  }, [state]);

  const handleSubmit = (formData) => {
    setEmail(formData.get("email"));
    formAction(formData);
  };

  return (
    <AuthContainer
      title="Reset Password"
      description="Enter your email and we'll send you a password reset link"
      icon={<KeyRound className="w-6 h-6 text-retro-primary" />}
    >
      <AuthForm
        formType="forgetpass"
        action={handleSubmit}
        defaultEmail={email}
      >
        <SubmitButton
          disabled={isLoading}
          className="w-full retro-button retro-button-primary mt-2"
        >
          {isLoading ? (
            "Sending..."
          ) : (
            <>
              <KeyRound className="w-4 h-4 mr-2" />
              Send Reset Link
            </>
          )}
        </SubmitButton>
      </AuthForm>

      <div className="flex justify-center mt-6 pt-4 border-t border-retro-border">
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 
                flex items-center gap-2 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>
            Back to{" "}
            <span className="font-medium text-retro-primary underline-offset-2 group-hover:underline">
              Sign in
            </span>
          </span>
        </Link>
      </div>
    </AuthContainer>
  );
}
