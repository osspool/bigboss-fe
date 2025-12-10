"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const HeaderSection = ({
  title,
  description,
  actions = null,
  icon: Icon = null,
  iconClassName,
  loading = false,
  variant = "default", // 'default' | 'compact' | 'hero' | 'minimal'
  className,
  badge,
  breadcrumbs,
  metadata,
  children,
}) => {
  // Variant-specific styles
  const variants = {
    default: {
      wrapper: "px-6 py-5 rounded-xl shadow-sm border bg-background hover:shadow-md",
      title: "text-2xl font-semibold tracking-tight",
      description: "text-sm text-muted-foreground",
      iconSize: "size-10",
      iconInner: "size-5",
      spacing: "space-y-1",
    },
    compact: {
      wrapper: "px-4 py-3 rounded-lg border bg-background/50",
      title: "text-lg font-semibold",
      description: "text-xs text-muted-foreground",
      iconSize: "size-8",
      iconInner: "size-4",
      spacing: "space-y-0.5",
    },
    hero: {
      wrapper: "px-8 py-8  rounded-2xl shadow-lg border bg-gradient-to-br from-background to-muted/20",
      title: "text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent",
      description: "text-base text-muted-foreground mt-2",
      iconSize: "size-14",
      iconInner: "size-7",
      spacing: "space-y-2",
    },
    minimal: {
      wrapper: "px-0 py-2 ",
      title: "text-xl font-medium",
      description: "text-sm text-muted-foreground",
      iconSize: "size-8",
      iconInner: "size-4",
      spacing: "space-y-0.5",
    },
  };

  const currentVariant = variants[variant] || variants.default;

  // Loading state
  if (loading && !title) {
    return (
      <div className={cn(currentVariant.wrapper, "transition-all duration-300", className)}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {Icon && <Skeleton className={cn(currentVariant.iconSize, "rounded-lg")} />}
            <div className={currentVariant.spacing}>
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-64 mt-1" />
            </div>
          </div>
          {actions && (
            <div className="flex gap-2 mt-4 sm:mt-0">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "transition-all duration-300",
        currentVariant.wrapper,
        className
      )}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <nav className="mb-3 text-sm text-muted-foreground">
          {breadcrumbs}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          {/* Icon */}
          {Icon && (
            <div
              className={cn(
                "flex aspect-square items-center justify-center rounded-lg flex-shrink-0",
                "bg-primary/10 text-primary",
                currentVariant.iconSize,
                iconClassName
              )}
            >
              <Icon className={currentVariant.iconInner} />
            </div>
          )}

          {/* Title and Description */}
          <div className={cn("flex-1", currentVariant.spacing)}>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className={cn("leading-none", currentVariant.title)}>
                {title}
              </h1>
              {badge && (
                <Badge 
                  variant={badge.variant || "secondary"} 
                  className={cn("ml-2", badge.className)}
                >
                  {badge.text}
                </Badge>
              )}
            </div>
            
            {description && (
              <p className={currentVariant.description}>{description}</p>
            )}
            
            {/* Metadata */}
            {metadata && (
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                {metadata.map((item, index) => (
                  <div key={index} className="flex items-center gap-1">
                    {item.icon && <item.icon className="size-3" />}
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
            {actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                disabled={loading || action.disabled}
                variant={action.variant || "default"}
                size={action.size || (variant === "compact" ? "sm" : "default")}
                className={cn(
                  variant === "hero" && "shadow-md hover:shadow-lg",
                  action.className
                )}
              >
                {action.icon && action.iconPosition !== "right" && (
                  <action.icon className="size-4 mr-2" />
                )}
                <span>{loading ? action.loadingText || "Loading..." : action.text}</span>
                {action.icon && action.iconPosition === "right" && (
                  <action.icon className="size-4 ml-2" />
                )}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Additional content slot */}
      {children && (
        <div
          className={cn(
            "mt-4 pt-4 border-t",
            variant === "minimal" && "border-0 pt-2"
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default HeaderSection;