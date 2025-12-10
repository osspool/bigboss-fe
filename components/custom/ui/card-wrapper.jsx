"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function CardWrapper({
    title,
    description,
    children,
    footer,
    className,
    headerClassName,
    contentClassName,
    footerClassName,
    variant = "default",
    size = "default",
    hideHeader = false,
    ...props
}) {
    // Variant styles
    const variants = {
        default: "",
        outline: "border-2",
        ghost: "border-0 shadow-none bg-transparent",
        elevated: "shadow-lg border-0",
        primary: "border-primary/20 bg-primary/5",
        secondary: "border-secondary/20 bg-secondary/5",
        destructive: "border-destructive/20 bg-destructive/5",
        success: "border-green-500/20 bg-green-500/5",
        warning: "border-yellow-500/20 bg-yellow-500/5",
    };

    // Size variants
    const sizes = {
        sm: "p-3",
        default: "p-6",
        lg: "p-8",
        xl: "p-10",
    };

    const contentSizes = {
        sm: "pt-3",
        default: "pt-6",
        lg: "pt-8", 
        xl: "pt-10",
    };

    return (
        <Card 
            className={cn(
                variants[variant],
                className
            )}
            {...props}
        >
            {!hideHeader && (title || description) && (
                <CardHeader className={cn(sizes[size], "pb-4", headerClassName)}>
                    {title && (
                        <CardTitle className="text-lg font-semibold">
                            {title}
                        </CardTitle>
                    )}
                    {description && (
                        <CardDescription>
                            {description}
                        </CardDescription>
                    )}
                </CardHeader>
            )}

            <CardContent className={cn(
                hideHeader ? sizes[size] : contentSizes[size],
                contentClassName
            )}>
                {children}
            </CardContent>

            {footer && (
                <CardFooter className={cn(sizes[size], "pt-4 border-t", footerClassName)}>
                    <div className="w-full">
                        {footer}
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}

// Convenience components for common patterns
export function DataCard({ title, data, className, ...props }) {
    return (
        <CardWrapper
            title={title}
            className={cn("space-y-4", className)}
            {...props}
        >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {data.map((item, index) => (
                    <div key={index} className="space-y-1">
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className={cn(
                            "text-lg font-semibold",
                            item.color && `text-${item.color}-600`
                        )}>
                            {item.value}
                        </p>
                    </div>
                ))}
            </div>
        </CardWrapper>
    );
}

export function LoadingCard({ title, description, className, ...props }) {
    return (
        <CardWrapper
            title={title}
            description={description}
            className={className}
            {...props}
        >
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Loading...</span>
            </div>
        </CardWrapper>
    );
}

export function StatsCard({ title, value, description, icon, trend, className, ...props }) {
    return (
        <CardWrapper
            className={cn("relative overflow-hidden", className)}
            size="sm"
            {...props}
        >
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                    {description && (
                        <p className="text-xs text-muted-foreground">{description}</p>
                    )}
                </div>
                {icon && (
                    <div className="text-muted-foreground/50">
                        {icon}
                    </div>
                )}
            </div>
            {trend && (
                <div className={cn(
                    "absolute top-2 right-2 text-xs px-2 py-1 rounded-full",
                    trend.type === "up" && "bg-green-100 text-green-700",
                    trend.type === "down" && "bg-red-100 text-red-700",
                    trend.type === "neutral" && "bg-gray-100 text-gray-700"
                )}>
                    {trend.value}
                </div>
            )}
        </CardWrapper>
    );
}

export function DraggableCard({
    title,
    subtitle,
    badges,
    actions,
    details,
    dragHandleProps,
    className,
    isDragging,
    isHidden,
    children,
    ...props
}) {
    return (
        <CardWrapper
            hideHeader
            className={cn(
                "transition-all",
                isDragging && "shadow-lg rotate-2",
                isHidden && "opacity-50",
                className
            )}
            contentClassName="!pt-4"
            {...props}
        >
            <div className="flex items-start gap-3">
                {/* Drag Handle */}
                {dragHandleProps && (
                    <div {...dragHandleProps} className="mt-1 cursor-grab hover:text-foreground">
                        {dragHandleProps.icon || (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                                <circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/>
                                <circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>
                            </svg>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-3">
                    {/* Header with title, subtitle and badges */}
                    <div className="flex flex-wrap items-center gap-2">
                        {title && <h4 className="font-medium">{title}</h4>}
                        {badges && (
                            <div className="flex flex-wrap gap-1">
                                {badges}
                            </div>
                        )}
                    </div>

                    {subtitle && (
                        <p className="text-xs text-muted-foreground break-words">
                            {subtitle}
                        </p>
                    )}

                    {/* Details section */}
                    {details}

                    {/* Children content */}
                    {children}
                </div>

                {/* Actions */}
                {actions && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {actions}
                    </div>
                )}
            </div>
        </CardWrapper>
    );
} 