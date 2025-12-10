import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type Background = "default" | "muted" | "primary" | "transparent";
type Padding = "none" | "sm" | "md" | "lg" | "xl";

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  background?: Background;
  padding?: Padding;
}

const backgrounds: Record<Background, string> = {
  default: "bg-background",
  muted: "bg-muted",
  primary: "bg-primary text-primary-foreground",
  transparent: "bg-transparent",
};

const paddings: Record<Padding, string> = {
  none: "",
  sm: "py-8 md:py-12",
  md: "py-12 md:py-16",
  lg: "py-16 md:py-24",
  xl: "py-24 md:py-32",
};

export function Section({
  id,
  children,
  className,
  background = "default",
  padding = "sm",
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(backgrounds[background], paddings[padding], className)}
    >
      {children}
    </section>
  );
}
