import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaCheckboxProps {
  isSelected: boolean;
  onToggle: () => void;
  variant?: 'grid' | 'list';
}

export function MediaCheckbox({ isSelected, onToggle, variant = 'grid' }: MediaCheckboxProps) {
  return (
    <div
      role="checkbox"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onToggle();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      className={cn(
        "flex items-center justify-center cursor-pointer transition-all",
        variant === 'grid'
          ? "w-6 h-6 rounded-md border-2"
          : "w-5 h-5 rounded border-2",
        isSelected
          ? "bg-primary border-primary"
          : variant === 'grid'
          ? "bg-background/90 border-muted-foreground/30 hover:border-primary"
          : "border-muted-foreground/30 hover:border-primary"
      )}
    >
      {isSelected && (
        <Check className={cn(
          "text-primary-foreground",
          variant === 'grid' ? "h-4 w-4" : "h-3 w-3"
        )} />
      )}
    </div>
  );
}
