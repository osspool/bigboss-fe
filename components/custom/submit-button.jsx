"use client";

import { useFormStatus } from "react-dom";

import { Button } from "../ui/button";
import { LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function SubmitButton({ children, disabled, className, ...props }) {
  const { pending } = useFormStatus();

  const isDisabled = pending || disabled;

  return (
    <Button
      type="submit"
      aria-disabled={isDisabled}
      className={cn("relative", className)}
      disabled={isDisabled}
      {...props}
    >
      {children}
      {pending && (
        <span className="animate-spin absolute right-4">
          <LoaderIcon />
        </span>
      )}
      <span aria-live="polite" className="sr-only" role="status">
        {pending ? "Loading" : "Submit form"}
      </span>
    </Button>
  );
}
