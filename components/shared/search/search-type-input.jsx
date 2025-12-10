"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearch } from "./search-context";

/**
 * Search input component with type selector using InputGroup pattern
 *
 * @example
 * <Search.TypeInput
 *   placeholder="Search..."
 *   searchTypeOptions={[
 *     { value: "_id", label: "ID" },
 *     { value: "customerPhone", label: "Phone" },
 *     { value: "customerEmail", label: "Email" },
 *   ]}
 * />
 */
export function SearchTypeInput({
  placeholder = "Search...",
  className,
  disabled,
  showIcon = true,
  showClearButton = false,
  searchTypeOptions = [],
  onKeyDown,
  ...props
}) {
  const { searchValue, setSearchValue, searchType, setSearchType, handleSearch } = useSearch();

  const handleKeyDown = (event) => {
    onKeyDown?.(event);
    if (!event.defaultPrevented && event.key === "Enter" && !disabled) {
      handleSearch?.();
    }
  };

  const selectedOption = searchTypeOptions.find(opt => opt.value === searchType);

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

      {/* Search Type Selector */}
      {searchTypeOptions.length > 0 && (
        <InputGroupAddon align="inline-start" className="pr-0">
          <Select
            value={searchType}
            onValueChange={setSearchType}
            disabled={disabled}
          >
            <SelectTrigger
              className="h-7 w-auto border-0 bg-transparent px-2 text-sm font-medium shadow-none focus:ring-0"
            >
              <SelectValue>
                {selectedOption?.label || searchTypeOptions[0]?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {searchTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="h-6 w-px bg-border ml-1" />
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
