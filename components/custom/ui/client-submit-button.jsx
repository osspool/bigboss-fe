"use client";

import { Button } from "@/components/ui/button";
import { LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ClientSubmitButton({
  children,
  disabled,
  loading = false,
  loadingText,
  className,
  ...props
}) {
  const isDisabled = loading || disabled;
  const content = loading && loadingText ? loadingText : children;

  return (
    <Button
      type="submit"
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={cn("relative", className)}
      disabled={isDisabled}
      {...props}
    >
      {content}
      {loading && (
        <span className="animate-spin absolute right-4">
          <LoaderIcon />
        </span>
      )}
      <span aria-live="polite" className="sr-only" role="status">
        {loading ? "Loading" : "Submit form"}
      </span>
    </Button>
  );
}
