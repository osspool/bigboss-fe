"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import { useSearch } from "./search-context";

/**
 * Search input component using modern shadcn InputGroup pattern
 *
 * @example
 * <Search.Input placeholder="Search..." />
 */
export function SearchInput({
  placeholder = "Search...",
  className,
  disabled,
  showIcon = true,
  showClearButton = false,
  onKeyDown,
  ...props
}) {
  const { searchValue, setSearchValue, handleSearch } = useSearch();

  const handleKeyDown = (event) => {
    onKeyDown?.(event);
    if (!event.defaultPrevented && event.key === "Enter" && !disabled) {
      handleSearch?.();
    }
  };

  return (
    <InputGroup
      className={cn("h-10 flex-1 shadow-sm", className)}
      data-disabled={disabled || undefined}
    >
      {showIcon && (
        <InputGroupAddon align="inline-start">
          <Search className="size-4" />
        </InputGroupAddon>
      )}

      <InputGroupInput
        {...props}
        type="text"
        placeholder={placeholder}
        value={searchValue || ""}
        onChange={(e) => setSearchValue?.(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="text-base"
      />

      {showClearButton && searchValue && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            variant="ghost"
            size="icon-sm"
            onClick={() => setSearchValue?.("")}
            disabled={disabled}
          >
            <X className="size-4" />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
