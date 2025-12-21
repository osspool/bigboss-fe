import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface HeaderAction {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  loadingText?: string;
}

interface HeaderBadge {
  text: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

interface HeaderMetadata {
  text: string;
  icon?: LucideIcon;
}

interface HeaderSectionProps {
  title?: string;
  description?: string;
  actions?: HeaderAction[] | null;
  icon?: LucideIcon | null;
  iconClassName?: string;
  loading?: boolean;
  variant?: "default" | "compact" | "hero" | "minimal";
  className?: string;
  badge?: HeaderBadge | ReactNode;
  breadcrumbs?: ReactNode;
  metadata?: HeaderMetadata[];
  children?: ReactNode;
}

declare const HeaderSection: React.FC<HeaderSectionProps>;
export default HeaderSection;
