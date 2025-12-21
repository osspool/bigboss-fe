import type { ReactNode, ComponentPropsWithoutRef } from "react";

interface ConfirmDialogProps extends Omit<ComponentPropsWithoutRef<"div">, "title"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "default" | "outline" | "secondary" | "ghost" | "link";
  isLoading?: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export declare function ConfirmDialog(props: ConfirmDialogProps): JSX.Element;

interface DeleteConfirmDialogProps extends Omit<ConfirmDialogProps, "title" | "description" | "confirmText" | "cancelText" | "variant"> {
  itemName?: string;
  itemDetails?: ReactNode;
}

export declare function DeleteConfirmDialog(props: DeleteConfirmDialogProps): JSX.Element;
