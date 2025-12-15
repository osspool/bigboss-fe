"use client";

import { memo, useMemo, useCallback, type ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Size variants configuration
const SIZE_VARIANTS = {
  sm: "sm:max-w-md",
  default: "w-full sm:max-w-md md:max-w-lg",
  lg: "w-full sm:max-w-md md:max-w-lg lg:max-w-4xl",
  xl: "w-full sm:max-w-5xl",
  full: "w-full max-w-full",
  mobile: "w-[85%] max-w-sm",
  "mobile-nav": "w-[300px] sm:w-[350px]",
} as const;

type SizeVariant = keyof typeof SIZE_VARIANTS;

// Helper to get padding based on size
const getPadding = (size: SizeVariant, type: "default" | "header" | "footer" = "default") => {
  const isFullSize = size === "full";

  if (type === "header" || type === "footer") {
    return isFullSize ? "px-6 lg:px-8" : "px-4";
  }

  return isFullSize ? "p-6 lg:p-8" : "p-4";
};

// ==================== SheetWrapper Props ====================

export interface SheetWrapperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  size?: SizeVariant;
  modal?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  innerClassName?: string;
  hideHeader?: boolean;
  hideTitle?: boolean;
  hideDescription?: boolean;
  hideCloseButton?: boolean;
  disableContentPadding?: boolean;
}

export const SheetWrapper = memo(function SheetWrapper({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  header,
  side = "right",
  size = "default",
  modal = true,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  innerClassName,
  hideHeader = false,
  hideTitle = false,
  hideDescription = false,
  disableContentPadding = false,
}: SheetWrapperProps) {
  // Memoize computed values
  const computedClasses = useMemo(
    () => ({
      header: cn("border-b pb-4 pt-6", getPadding(size, "header"), headerClassName),
      inner: cn("flex-1 overflow-y-auto", !disableContentPadding && getPadding(size), innerClassName),
      footer: cn("border-t bg-muted/30 pt-4 pb-6 mt-auto", getPadding(size, "footer"), footerClassName),
    }),
    [size, headerClassName, innerClassName, footerClassName, disableContentPadding]
  );

  // Determine if title/description should be visually hidden
  const shouldHideTitle = !!header || hideTitle;
  const shouldHideDescription = !!header || hideDescription;

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={modal}>
      <SheetContent
        side={side}
        className={cn(SIZE_VARIANTS[size], "flex flex-col p-0", contentClassName, className)}
      >
        {!hideHeader && (
          <SheetHeader className={computedClasses.header}>
            {/*
             * Always render title and description for accessibility (ARIA compliance)
             * They are visually hidden (sr-only) when custom header is provided
             */}
            <SheetTitle className={shouldHideTitle ? "sr-only" : ""}>{title || "Sheet"}</SheetTitle>
            {description && (
              <SheetDescription className={shouldHideDescription ? "sr-only" : ""}>
                {description}
              </SheetDescription>
            )}
            {/* Render custom header content if provided */}
            {header}
          </SheetHeader>
        )}

        <div className={computedClasses.inner}>{children}</div>

        {footer && <SheetFooter className={computedClasses.footer}>{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  );
});

// ==================== FormSheet Props ====================

export interface FormSheetProps extends Omit<SheetWrapperProps, "footer"> {
  onSubmit?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  submitDisabled?: boolean;
  submitLoading?: boolean;
  formId?: string;
}

export const FormSheet = memo(function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  onCancel,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  submitDisabled = false,
  submitLoading = false,
  formId,
  size = "lg",
  ...props
}: FormSheetProps) {
  const handleCancel = useCallback(() => {
    onCancel?.();
    onOpenChange?.(false);
  }, [onCancel, onOpenChange]);

  const footer = useMemo(
    () => (
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <Button type="button" variant="outline" className="flex-1" onClick={handleCancel}>
          {cancelLabel}
        </Button>
        <Button type="submit" form={formId} className="flex-1" disabled={submitDisabled || submitLoading}>
          {submitLoading ? "Saving..." : submitLabel}
        </Button>
      </div>
    ),
    [cancelLabel, submitLabel, submitDisabled, submitLoading, formId, handleCancel]
  );

  return (
    <SheetWrapper
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size={size}
      footer={footer}
      {...props}
    >
      {children}
    </SheetWrapper>
  );
});

// ==================== ConfirmSheet Props ====================

export interface ConfirmSheetProps extends Omit<SheetWrapperProps, "footer"> {
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
}

export const ConfirmSheet = memo(function ConfirmSheet({
  open,
  onOpenChange,
  title = "Confirm Action",
  description,
  children,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "default",
  confirmDisabled = false,
  confirmLoading = false,
  size = "sm",
  ...props
}: ConfirmSheetProps) {
  const handleConfirm = useCallback(() => {
    onConfirm?.();
  }, [onConfirm]);

  const handleCancel = useCallback(() => {
    onCancel?.();
    onOpenChange?.(false);
  }, [onCancel, onOpenChange]);

  const footer = useMemo(
    () => (
      <div className="flex gap-2 w-full">
        <Button type="button" variant="outline" className="flex-1" onClick={handleCancel}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={confirmVariant}
          className="flex-1"
          onClick={handleConfirm}
          disabled={confirmDisabled || confirmLoading}
        >
          {confirmLoading ? "Loading..." : confirmLabel}
        </Button>
      </div>
    ),
    [cancelLabel, confirmLabel, confirmVariant, confirmDisabled, confirmLoading, handleConfirm, handleCancel]
  );

  return (
    <SheetWrapper
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size={size}
      footer={footer}
      {...props}
    >
      {children}
    </SheetWrapper>
  );
});

// Export base components for composition
export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter };
