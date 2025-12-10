"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function TooltipWrapper({
  children,
  content,
  side = "top",
  align = "center",
  delayDuration = 700,
  skipDelayDuration = 300,
  sideOffset = 4,
  className,
  contentClassName,
  disabled = false,
  asChild = true,
  ...props
}) {
  if (disabled || !content) {
    return children;
  }

  return (
    <Tooltip
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      {...props}
    >
      <TooltipTrigger asChild={asChild} className={className}>
        {children}
      </TooltipTrigger>
      <TooltipContent
        side={side}
        align={align}
        sideOffset={sideOffset}
        className={cn(contentClassName)}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

// Convenience components for common patterns
export function ButtonTooltip({ 
  children, 
  tooltip, 
  variant = "outline",
  size = "icon",
  className,
  ...props 
}) {
  return (
    <TooltipWrapper content={tooltip} {...props}>
      {children}
    </TooltipWrapper>
  );
}

export function IconTooltip({ 
  icon, 
  tooltip, 
  className,
  iconClassName,
  size = 16,
  ...props 
}) {
  return (
    <TooltipWrapper content={tooltip} className={className} {...props}>
      <div className={cn("cursor-pointer", iconClassName)}>
        {typeof icon === "string" ? (
          <span style={{ fontSize: size }}>{icon}</span>
        ) : (
          icon
        )}
      </div>
    </TooltipWrapper>
  );
}

export function InfoTooltip({ 
  tooltip, 
  className,
  size = 16,
  ...props 
}) {
  return (
    <TooltipWrapper 
      content={tooltip} 
      className={cn("inline-flex items-center", className)}
      {...props}
    >
      <div className="rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors cursor-help inline-flex items-center justify-center" 
           style={{ width: size, height: size, fontSize: size * 0.6 }}>
        ?
      </div>
    </TooltipWrapper>
  );
}

export function ActionTooltip({ 
  children, 
  tooltip, 
  action,
  variant = "ghost",
  size = "sm",
  className,
  ...props 
}) {
  return (
    <TooltipWrapper content={tooltip} {...props}>
      <button
        onClick={action}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          // Variant styles
          variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
          variant === "outline" && "border border-input hover:bg-accent hover:text-accent-foreground",
          // Size styles
          size === "sm" && "h-8 px-2",
          size === "icon" && "h-8 w-8",
          className
        )}
      >
        {children}
      </button>
    </TooltipWrapper>
  );
} 