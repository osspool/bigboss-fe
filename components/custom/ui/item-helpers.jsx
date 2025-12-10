"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from "@/components/ui/item";
import { cva } from "class-variance-authority";
import { Icon } from "@/components/custom/ui/icon";

/**
 * Item Component Helpers
 *
 * Composition utilities for shadcn Item component
 * Adds gradient borders, custom icon sizes, and common patterns
 *
 * PERFORMANCE:
 * - React.memo for component reuse
 * - Stable keys for lists
 * - Minimal re-renders
 *
 * SEO:
 * - Semantic HTML (h3 for titles)
 * - Proper heading hierarchy
 * - Descriptive aria-labels
 */

/**
 * IconItemMedia - Icon display with custom backgrounds and sizes
 *
 * @example
 * <IconItemMedia icon="heart" iconBg="primary" iconSize="lg" />
 */
const iconItemMediaVariants = cva(
  "rounded-xl flex items-center justify-center shrink-0",
  {
    variants: {
      iconBg: {
        primary: "bg-primary/10 text-primary",
        gold: "bg-primary/20 text-primary",
        muted: "bg-muted text-foreground",
        gradient: "bg-gradient-to-br from-primary/20 to-primary/10 text-primary",
        none: "bg-transparent",
      },
      iconSize: {
        sm: "size-8",
        md: "size-10 md:size-12",
        lg: "size-12 md:size-14",
        xl: "size-16 md:size-20",
      },
    },
    defaultVariants: {
      iconBg: "primary",
      iconSize: "md",
    },
  }
);

const iconSizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export const IconItemMedia = React.memo(function IconItemMedia({
  icon,
  iconBg = "primary",
  iconSize = "md",
  className,
  children,
  ...props
}) {
  return (
    <div
      data-slot="item-media"
      role="presentation"
      className={cn(iconItemMediaVariants({ iconBg, iconSize }), className)}
      {...props}
    >
      {children || (
        icon && <Icon name={icon} size={iconSizeMap[iconSize]} aria-hidden="true" />
      )}
    </div>
  );
});

IconItemMedia.displayName = "IconItemMedia";

/**
 * FeatureItem - Common pattern: Icon + Title + Description
 * Optimized for feature lists and benefit grids
 *
 * @example
 * <FeatureItem
 *   icon="heart"
 *   title="Better Health"
 *   description="Improve your wellbeing"
 *   variant="gradient-light"
 * />
 */
export const FeatureItem = React.memo(function FeatureItem({
  icon,
  iconBg = "primary",
  iconSize = "md",
  title,
  description,
  variant = "outline",
  size = "default",
  layout = "vertical",
  titleAs = "h3",
  className,
  titleClassName,
  descriptionClassName,
  iconClassName,
  children,
  ...props
}) {
  const hasGradientBorder = variant === "gradient-light" || variant === "gradient";

  const TitleComponent = titleAs;

  // Gradient border wrapper
  if (hasGradientBorder) {
    return (
      <div
        className={cn(
          variant === "gradient-light" ? "gradient-border-light" : "gradient-border",
          "rounded-2xl hover:gradient-border-hover transition-all duration-300",
          className
        )}
      >
        <div className={cn(
          "gradient-border-inner rounded-2xl p-6 flex",
          layout === "vertical" ? "flex-col items-start gap-4" : "flex-row items-center gap-4"
        )}>
          {icon && (
            <IconItemMedia
              icon={icon}
              iconBg={iconBg}
              iconSize={iconSize}
              className={cn(layout === "vertical" ? "" : "shrink-0", iconClassName)}
            />
          )}
          <div className="flex flex-col gap-2 flex-1">
            {title && (
              <TitleComponent className={cn("text-base md:text-lg font-semibold text-foreground leading-tight", titleClassName)}>
                {title}
              </TitleComponent>
            )}
            {description && (
              <p className={cn("text-sm text-muted-foreground leading-relaxed", descriptionClassName)}>
                {description}
              </p>
            )}
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Standard Item usage
  return (
    <Item
      variant={variant}
      size={size}
      className={cn(
        layout === "vertical" && "flex-col items-start",
        className
      )}
      {...props}
    >
      {icon && (
        <IconItemMedia
          icon={icon}
          iconBg={iconBg}
          iconSize={iconSize}
          className={iconClassName}
        />
      )}
      <ItemContent>
        {title && (
          <TitleComponent
            data-slot="item-title"
            className={cn("text-base md:text-lg font-semibold text-foreground leading-tight mb-2", titleClassName)}
          >
            {title}
          </TitleComponent>
        )}
        {description && (
          <ItemDescription className={cn("text-sm text-muted-foreground leading-relaxed", descriptionClassName)}>
            {description}
          </ItemDescription>
        )}
        {children}
      </ItemContent>
    </Item>
  );
});

FeatureItem.displayName = "FeatureItem";

/**
 * FeatureList - Grid of feature items
 * Handles responsive layouts and animations
 *
 * @example
 * <FeatureList
 *   items={[{icon: "heart", title: "...", description: "..."}]}
 *   columns={3}
 *   variant="gradient-light"
 * />
 */
export function FeatureList({
  items = [],
  columns = 3,
  variant = "outline",
  iconBg = "primary",
  iconSize = "md",
  layout = "vertical",
  className,
  itemClassName,
  ...props
}) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div
      role="list"
      className={cn(
        "grid gap-6",
        gridCols[columns] || gridCols[3],
        className
      )}
      {...props}
    >
      {items.map((item, index) => (
        <div
          key={item.id || item.title || index}
          role="listitem"
          className="opacity-0 animate-fade-in-up"
          style={{
            animationDelay: `${index * 100}ms`,
            animationFillMode: 'forwards'
          }}
        >
          <FeatureItem
            icon={item.icon}
            iconBg={item.iconBg || iconBg}
            iconSize={item.iconSize || iconSize}
            title={item.title}
            description={item.description}
            variant={variant}
            layout={layout}
            className={itemClassName}
          />
        </div>
      ))}
    </div>
  );
}

FeatureList.displayName = "FeatureList";
