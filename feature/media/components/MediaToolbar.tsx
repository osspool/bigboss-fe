import { Grid3X3, List, Trash2, RefreshCw, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MediaToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onRefresh: () => void;
  loading?: boolean;
  selectable?: boolean;
  onConfirmSelection?: () => void;
}

export function MediaToolbar({
  searchQuery,
  onSearchChange,
  selectedCount,
  onClearSelection,
  onBulkDelete,
  viewMode,
  onViewModeChange,
  onRefresh,
  loading,
  selectable,
  onConfirmSelection,
}: MediaToolbarProps) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 border-b border-border flex-wrap">
      {/* Search */}
      <div className="relative flex-1 max-w-md min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search media..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-9 h-9"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => onSearchChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedCount} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
          >
            Clear
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onBulkDelete}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      )}

      {/* View Toggle */}
      <div className="flex items-center border border-border rounded-lg p-1">
        <Button
          variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
          size="icon"
          className="h-7 w-7"
          onClick={() => onViewModeChange('grid')}
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'secondary' : 'ghost'}
          size="icon"
          className="h-7 w-7"
          onClick={() => onViewModeChange('list')}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      {/* Refresh */}
      <Button variant="outline" size="icon" className="h-9 w-9" onClick={onRefresh}>
        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
      </Button>

      {/* Selection Confirm Button */}
      {selectable && selectedCount > 0 && onConfirmSelection && (
        <Button onClick={onConfirmSelection} size="sm">
          Select ({selectedCount})
        </Button>
      )}
    </div>
  );
}
