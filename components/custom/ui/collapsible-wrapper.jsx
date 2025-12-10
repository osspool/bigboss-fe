"use client";

import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function CollapsibleWrapper({
    children,
    trigger,
    defaultOpen = false,
    open,
    onOpenChange,
    triggerAsChild = false,
    triggerVariant = "outline",
    triggerSize = "sm",
    triggerClassName,
    contentClassName,
    className,
    showChevron = true,
    chevronPosition = "right", // "left" | "right"
    disabled = false,
    ...props
}) {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    
    // Use controlled or uncontrolled state
    const isOpen = open !== undefined ? open : internalOpen;
    const handleOpenChange = onOpenChange || setInternalOpen;

    // Default trigger component
    const defaultTrigger = (
        <Button
            variant={triggerVariant}
            size={triggerSize}
            disabled={disabled}
            className={cn(
                "justify-between",
                triggerClassName
            )}
        >
            {trigger}
            {showChevron && (
                <div className={cn(
                    "flex items-center",
                    chevronPosition === "left" && "order-first mr-2",
                    chevronPosition === "right" && "ml-2"
                )}>
                    {isOpen ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )}
                </div>
            )}
        </Button>
    );

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={handleOpenChange}
            disabled={disabled}
            className={cn("w-full", className)}
            {...props}
        >
            <CollapsibleTrigger asChild={triggerAsChild}>
                {triggerAsChild ? trigger : defaultTrigger}
            </CollapsibleTrigger>
            
            <CollapsibleContent className={cn("mt-2", contentClassName)}>
                {children}
            </CollapsibleContent>
        </Collapsible>
    );
}

// Convenience components for common patterns
export function CollapsibleCard({
    title,
    children,
    defaultOpen = false,
    className,
    headerClassName,
    contentClassName,
    ...props
}) {
    return (
        <div className={cn("border rounded-lg overflow-hidden", className)}>
            <CollapsibleWrapper
                trigger={title}
                defaultOpen={defaultOpen}
                triggerAsChild
                className="w-full"
                contentClassName="border-t"
                {...props}
            >
                <CollapsibleTrigger asChild>
                    <div className={cn(
                        "flex items-center justify-between w-full px-4 py-3 cursor-pointer transition-colors hover:bg-secondary/5",
                        headerClassName
                    )}>
                        <span className="font-medium">{title}</span>
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className={cn("px-4 py-3", contentClassName)}>
                        {children}
                    </div>
                </CollapsibleContent>
            </CollapsibleWrapper>
        </div>
    );
}

export function CollapsibleSection({
    label,
    children,
    defaultOpen = false,
    className,
    labelClassName,
    contentClassName,
    ...props
}) {
    return (
        <CollapsibleWrapper
            trigger={label}
            defaultOpen={defaultOpen}
            triggerVariant="ghost"
            triggerSize="sm"
            triggerClassName={cn("h-8 px-2 font-medium justify-between", labelClassName)}
            contentClassName={cn("pl-4 mt-1", contentClassName)}
            className={cn("space-y-1", className)}
            {...props}
        >
            {children}
        </CollapsibleWrapper>
    );
} 