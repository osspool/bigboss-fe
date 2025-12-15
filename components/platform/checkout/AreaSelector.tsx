"use client";

import { useState, useMemo, useCallback } from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  searchAreasEnhanced,
  getPopularAreas,
  getArea,
  getZoneName,
  buildAreaSelection,
} from "@/lib/logistics-utils";
import type { Area } from "@classytic/bd-areas";
import type { AreaSelection } from "@/lib/logistics-utils";

// Re-export AreaSelection type for consumers
export type { AreaSelection };

interface AreaSelectorProps {
  /** Selected area internalId */
  value?: number;
  /** Called when area is selected with full area data */
  onChange: (selection: AreaSelection | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Show zone name badge (delivery charge comes from API) */
  showZoneBadge?: boolean;
}

export function AreaSelector({
  value,
  onChange,
  placeholder = "Select delivery area...",
  disabled = false,
  className,
  showZoneBadge = true,
}: AreaSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get search results or popular areas
  const areas = useMemo(() => {
    if (searchQuery.trim().length >= 2) {
      return searchAreasEnhanced(searchQuery, 30);
    }
    // Show popular Dhaka areas by default
    return getPopularAreas(50);
  }, [searchQuery]);

  // Get selected area details
  const selectedArea = useMemo(() => {
    if (!value) return null;
    const area = getArea(value);
    if (!area) return null;
    return {
      ...area,
      zoneName: getZoneName(area.zoneId),
    };
  }, [value]);

  const handleSelect = useCallback(
    (area: Area & { zoneName: string }) => {
      // Build full AreaSelection with all required fields
      const selection = buildAreaSelection(area);
      onChange(selection);
      setOpen(false);
      setSearchQuery("");
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange(null);
  }, [onChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between h-auto min-h-10 py-2",
            !selectedArea && "text-muted-foreground",
            className
          )}
        >
          {selectedArea ? (
            <div className="flex items-center gap-2 text-left">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{selectedArea.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span>{selectedArea.districtName}</span>
                  {showZoneBadge && (
                    <>
                      <span>•</span>
                      <span>{selectedArea.zoneName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <span>{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search area, district, or postcode..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {searchQuery.length < 2
                ? "Type at least 2 characters to search..."
                : "No area found."}
            </CommandEmpty>
            <CommandGroup heading={searchQuery.length >= 2 ? "Search Results" : "Popular Areas"}>
              {areas.map((area) => (
                <CommandItem
                  key={area.internalId}
                  value={area.internalId.toString()}
                  onSelect={() => handleSelect(area)}
                  className="flex items-center gap-3 py-3"
                >
                  <Check
                    className={cn(
                      "h-4 w-4 flex-shrink-0",
                      value === area.internalId ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{area.name}</span>
                      {area.postCode && (
                        <span className="text-xs text-muted-foreground">
                          ({area.postCode})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>{area.districtName}</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {area.zoneName}
                      </Badge>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Compact area display for read-only views
 */
export function AreaBadge({
  areaId,
  areaName,
  zoneId,
  className,
}: {
  areaId?: number;
  areaName?: string;
  zoneId?: number;
  className?: string;
}) {
  const zoneName = zoneId ? getZoneName(zoneId) : null;

  if (!areaName) return null;

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
      <span>{areaName}</span>
      {zoneName && (
        <Badge variant="outline" className="text-[10px] font-normal">
          {zoneName}
        </Badge>
      )}
    </div>
  );
}
