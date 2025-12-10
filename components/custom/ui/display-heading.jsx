import { cn } from "@/lib/utils";

/**
 * DisplayHeading - Reusable component for hero/display headings
 * Provides consistent typography across the platform
 */
export function DisplayHeading({
  children,
  size = "xl",
  align = "center",
  className,
  highlightText,
  highlightColor = "primary",
  as: Component = "h1",
  ...props
}) {
  const sizeClasses = {
    lg: "text-3xl lg:text-5xl",
    xl: "text-4xl lg:text-6xl",
    "2xl": "text-5xl lg:text-7xl",
  };

  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const highlightClasses = {
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-accent",
    gradient: "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent",
  };

  // If highlightText is provided, split and highlight
  const renderContent = () => {
    if (typeof children !== "string" || !highlightText) {
      return children;
    }

    const parts = children.split(highlightText);
    return (
      <>
        {parts[0]}
        <span className={highlightClasses[highlightColor]}>
          {highlightText}
        </span>
        {parts[1]}
      </>
    );
  };

  return (
    <Component
      className={cn(
        "font-bold tracking-tight text-balance leading-[1.1]",
        sizeClasses[size],
        alignClasses[align],
        className
      )}
      {...props}
    >
      {renderContent()}
    </Component>
  );
}
