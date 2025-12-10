import { Edit, Copy, Download, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { copyToClipboard } from '@/lib/utils';
import type { MediaItem } from '../types';

interface MediaItemActionsProps {
  item: MediaItem;
  onEdit: (item: MediaItem) => void;
  onDelete: (id: string) => void;
  variant?: 'grid' | 'list';
}

export function MediaItemActions({
  item,
  onEdit,
  onDelete,
  variant = 'grid'
}: MediaItemActionsProps) {
  const handleCopyUrl = () => {
    copyToClipboard(item.url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
        <Button
          variant={variant === 'grid' ? 'secondary' : 'ghost'}
          size="icon"
          className={variant === 'grid' ? 'h-7 w-7' : 'h-8 w-8'}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(item)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyUrl}>
          <Copy className="h-4 w-4 mr-2" />
          Copy URL
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={item.url} download target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4 mr-2" />
            Download
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => onDelete(item._id)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
