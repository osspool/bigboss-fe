import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type MaxWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: MaxWidth;
}

const maxWidthClasses: Record<MaxWidth, string> = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
};

export function Container({
  children,
  className,
  maxWidth = "7xl",
}: ContainerProps) {
  const isFullWidth = maxWidth === "full";
  const baseClass = isFullWidth
    ? "w-full px-4 sm:px-6 lg:px-10"
    : "mx-auto px-4 sm:px-6 lg:px-8";

  return (
    <div className={cn(baseClass, !isFullWidth && maxWidthClasses[maxWidth], className)}>
      {children}
    </div>
  );
}
