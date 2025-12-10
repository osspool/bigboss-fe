"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, copyToClipboard } from "@/lib/utils";

export function CopyButton({ 
    value, 
    className,
    size = "sm",
    variant = "ghost",
    showToast = true,
    toastMessage = "Copied to clipboard",
    errorMessage = "Failed to copy to clipboard",
    timeout = 2000,
    children,
    ...props 
}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!value) return;

        const success = await copyToClipboard(value, {
            showToast,
            successMessage: toastMessage,
            errorMessage
        });

        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), timeout);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            className={cn("h-6 w-6 p-0", className)}
            onClick={handleCopy}
            disabled={!value}
            {...props}
        >
            {children || (copied ? (
                <Check className="h-3 w-3 text-green-600" />
            ) : (
                <Copy className="h-3 w-3" />
            ))}
        </Button>
    );
}

// Variant for inline text with copy functionality
export function CopyText({ 
    value, 
    displayValue,
    className,
    textClassName,
    buttonClassName,
    maxLength = 30,
    showButton = true,
    ...buttonProps 
}) {
    const truncatedValue = displayValue || (value && value.length > maxLength 
        ? `${value.substring(0, maxLength)}...` 
        : value || "N/A");

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <span 
                className={cn("font-medium", textClassName)}
                title={value || "N/A"}
            >
                {truncatedValue}
            </span>
            {showButton && value && (
                <CopyButton
                    value={value}
                    className={buttonClassName}
                    {...buttonProps}
                />
            )}
        </div>
    );
}

// Variant for code blocks or formatted text
export function CopyCodeBlock({ 
    value, 
    className,
    language,
    showLineNumbers = false,
    ...buttonProps 
}) {
    return (
        <div className={cn("relative group", className)}>
            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                <code className={language ? `language-${language}` : ""}>
                    {value}
                </code>
            </pre>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <CopyButton
                    value={value}
                    variant="secondary"
                    size="sm"
                    {...buttonProps}
                />
            </div>
        </div>
    );
} 