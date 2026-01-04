"use client";

import { useCallback, useRef } from "react";
import { Search, Grid, List, Loader2, RefreshCw, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ApiPagination } from "@classytic/clarity";
import { useMediaLibrary } from "../hooks/useMediaLibrary";
import { FOLDER_CONFIG } from "../types";
import type { Media, MediaFolder } from "@/types";
import Image from "next/image";

interface MediaLibraryPickerProps {
  token: string;
  onSelectionChange: (items: Media[]) => void;
  multiSelect?: boolean;
  initialFolder?: MediaFolder | "all";
}

export function MediaLibraryPicker({
  token,
  onSelectionChange,
  multiSelect = false,
  initialFolder = "all",
}: MediaLibraryPickerProps) {
  const {
    filteredItems,
    items,
    loading,
    fetching,
    selectedFolder,
    selectedIds,
    viewMode,
    searchQuery,
    pagination,
    loadMedia,
    selectFolder,
    selectItem,
    clearSelection,
    setViewMode,
    setSearchQuery,
    setPage,
  } = useMediaLibrary({
    token,
    initialFolder,
    multiSelect,
    selectable: true,
    limit: 24,
  });

  // Keep track of items for selection lookup
  const itemsRef = useRef<Media[]>([]);
  itemsRef.current = items;

  // Handle item click - select and notify parent
  const handleItemClick = useCallback(
    (item: Media) => {
      selectItem(item._id, multiSelect);

      // Calculate new selection and notify parent
      const currentIds = selectedIds.includes(item._id)
        ? selectedIds.filter((id) => id !== item._id)
        : multiSelect
        ? [...selectedIds, item._id]
        : [item._id];

      const selectedItems = itemsRef.current.filter((i) => currentIds.includes(i._id));
      onSelectionChange(selectedItems);
    },
    [selectItem, multiSelect, selectedIds, onSelectionChange]
  );

  // Handle clear selection
  const handleClearSelection = useCallback(() => {
    clearSelection();
    onSelectionChange([]);
  }, [clearSelection, onSelectionChange]);

  return (
    <div className="h-full flex flex-col">
      {/* Compact Toolbar */}
      <div className="px-4 py-3 border-b flex items-center gap-3 bg-muted/20">
        {/* Folder Select */}
        <Select value={selectedFolder} onValueChange={selectFolder}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <FolderOpen className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FOLDER_CONFIG.map((folder) => (
              <SelectItem key={folder.id} value={folder.id}>
                {folder.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>

        {/* View Toggle */}
        <div className="flex border rounded-md">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-r-none",
              viewMode === "grid" && "bg-muted"
            )}
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-l-none",
              viewMode === "list" && "bg-muted"
            )}
            onClick={() => setViewMode("list")}
          >
            <List className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Refresh */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => loadMedia()}
          disabled={fetching}
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", fetching && "animate-spin")}
          />
        </Button>
      </div>

      {/* Selection info */}
      {selectedIds.length > 0 && (
        <div className="px-4 py-2 bg-primary/5 border-b text-xs flex items-center justify-between">
          <span>
            {selectedIds.length} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={handleClearSelection}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Media Grid */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FolderOpen className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No media found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try a different folder or upload new media
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="p-4 grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {filteredItems.map((item) => (
              <MediaGridItem
                key={item._id}
                item={item}
                selected={selectedIds.includes(item._id)}
                onClick={() => handleItemClick(item)}
              />
            ))}
          </div>
        ) : (
          <div className="p-4 space-y-1">
            {filteredItems.map((item) => (
              <MediaListItem
                key={item._id}
                item={item}
                selected={selectedIds.includes(item._id)}
                onClick={() => handleItemClick(item)}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="border-t px-4 py-2">
          <ApiPagination
            {...pagination}
            onPageChange={setPage}
            showInfo={false}
            className="p-0 border-0 bg-transparent mb-0"
          />
        </div>
      )}
    </div>
  );
}

// Grid item component
function MediaGridItem({
  item,
  selected,
  onClick,
}: {
  item: Media;
  selected: boolean;
  onClick: () => void;
}) {
  const thumbnailUrl =
    item.variants?.find((v) => v.name === "thumbnail")?.url || item.url;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative aspect-square rounded-md overflow-hidden border-2 transition-all",
        "hover:ring-2 hover:ring-primary/50",
        "focus:outline-none focus:ring-2 focus:ring-primary",
        selected
          ? "border-primary ring-2 ring-primary/30"
          : "border-transparent"
      )}
    >
      <Image
        src={thumbnailUrl}
        alt={item.alt || item.filename}
        fill
        className="object-cover"
        sizes="150px"
        unoptimized
      />
      {selected && (
        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      )}
    </button>
  );
}

// List item component
function MediaListItem({
  item,
  selected,
  onClick,
}: {
  item: Media;
  selected: boolean;
  onClick: () => void;
}) {
  const thumbnailUrl =
    item.variants?.find((v) => v.name === "thumbnail")?.url || item.url;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-2 rounded-md transition-all",
        "hover:bg-muted/50",
        "focus:outline-none focus:ring-2 focus:ring-primary",
        selected && "bg-primary/10"
      )}
    >
      <div className="relative w-10 h-10 rounded overflow-hidden shrink-0">
        <Image
          src={thumbnailUrl}
          alt={item.alt || item.filename}
          fill
          className="object-cover"
          sizes="40px"
          unoptimized
        />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm truncate">{item.title || item.filename}</p>
        <p className="text-xs text-muted-foreground">
          {item.dimensions.width}×{item.dimensions.height}
        </p>
      </div>
      {selected && (
        <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
    </button>
  );
}
