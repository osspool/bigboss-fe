"use client";
import { Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFileSize, formatMediaDate, getThumbnailUrl } from '../utils';
import { MediaCheckbox } from './MediaCheckbox';
import { MediaItemActions } from './MediaItemActions';
import type { MediaItem } from '../types';

interface MediaGridProps {
  items: MediaItem[];
  selectedIds: string[];
  onSelectItem: (id: string, toggle?: boolean) => void;
  onOpenDetail: (item: MediaItem) => void;
  onDelete: (ids: string[]) => void;
  viewMode: 'grid' | 'list';
  loading?: boolean;
}

export function MediaGrid({
  items,
  selectedIds,
  onSelectItem,
  onOpenDetail,
  onDelete,
  viewMode,
  loading,
}: MediaGridProps) {

  if (loading) {
    return (
      <div className={cn(
        viewMode === 'grid'
          ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          : "space-y-2"
      )}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "bg-muted animate-pulse rounded-lg",
              viewMode === 'grid' ? "aspect-square" : "h-16"
            )}
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <Copy className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-1">No media found</h3>
        <p className="text-muted-foreground text-sm">
          Upload some images to get started
        </p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="w-12 p-3"></th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                File
              </th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Folder
              </th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Size
              </th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Date
              </th>
              <th className="w-12 p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map(item => {
              const isSelected = selectedIds.includes(item._id);
              
              return (
                <tr
                  key={item._id}
                  className={cn(
                    "hover:bg-muted/50 transition-colors cursor-pointer",
                    isSelected && "bg-primary/5"
                  )}
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey) {
                      onSelectItem(item._id, true);
                    } else {
                      onOpenDetail(item);
                    }
                  }}
                >
                  <td className="p-3" onClick={e => e.stopPropagation()}>
                    <MediaCheckbox
                      isSelected={isSelected}
                      onToggle={() => onSelectItem(item._id, true)}
                      variant="list"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={getThumbnailUrl(item)}
                        alt={item.alt || item.filename}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-sm truncate max-w-[200px]">
                          {item.title || item.filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.dimensions?.width} × {item.dimensions?.height}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-sm capitalize">{item.folder}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-muted-foreground">
                      {formatFileSize(item.size)}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-muted-foreground">
                      {formatMediaDate(item.createdAt)}
                    </span>
                  </td>
                  <td className="p-3">
                    <MediaItemActions
                      item={item}
                      onEdit={onOpenDetail}
                      onDelete={(id) => onDelete([id])}
                      variant="list"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {items.map(item => {
        const isSelected = selectedIds.includes(item._id);

        return (
          <div
            key={item._id}
            className={cn(
              "group relative aspect-square rounded-xl overflow-hidden cursor-pointer",
              "border-2 transition-all duration-200",
              isSelected
                ? "border-primary ring-2 ring-primary/20"
                : "border-transparent hover:border-primary/50"
            )}
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey) {
                onSelectItem(item._id, true);
              } else {
                onOpenDetail(item);
              }
            }}
          >
            <img
              src={getThumbnailUrl(item)}
              alt={item.alt || item.filename}
              className="w-full h-full object-cover"
            />

            {/* Selection Checkbox */}
            <div className="absolute top-2 left-2 z-10">
              <MediaCheckbox
                isSelected={isSelected}
                onToggle={() => onSelectItem(item._id, true)}
                variant="grid"
              />
            </div>

            {/* Hover Overlay */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            )}>
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white text-sm font-medium truncate">
                  {item.title || item.filename}
                </p>
                <p className="text-white/70 text-xs">
                  {formatFileSize(item.size)}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <MediaItemActions
                item={item}
                onEdit={onOpenDetail}
                onDelete={(id) => onDelete([id])}
                variant="grid"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
