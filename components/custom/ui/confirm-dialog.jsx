"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConfirmDialog({
    open,
    onOpenChange,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "destructive",
    isLoading = false,
    onConfirm,
    onCancel,
    icon,
    children,
    className,
    ...props
}) {
    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            onOpenChange(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange} {...props}>
            <AlertDialogContent className={cn("max-w-md", className)}>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        {icon || (variant === "destructive" && <AlertTriangle className="h-5 w-5 text-destructive" />)}
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {children && (
                    <div className="py-4">
                        {children}
                    </div>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isLoading}
                        variant={variant}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading...
                            </div>
                        ) : (
                            confirmText
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// Specialized delete confirmation dialog
export function DeleteConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    isLoading = false,
    itemName = "item",
    itemDetails,
    ...props
}) {
    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Delete Item"
            description={`Are you sure you want to delete this ${itemName}? This action cannot be undone.`}
            confirmText="Yes, Delete"
            cancelText="No"
            variant="destructive"
            isLoading={isLoading}
            onConfirm={onConfirm}
            {...props}
        >
            {itemDetails && (
                <div className="bg-muted/50 p-3 rounded-md">
                    <div className="text-sm space-y-1">
                        {itemDetails}
                    </div>
                </div>
            )}
        </ConfirmDialog>
    );
} 