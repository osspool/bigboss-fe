import { 
  Images, 
  Folder, 
  Package, 
  Grid3X3, 
  Image, 
  FileText, 
  Award,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FOLDER_CONFIG } from '../types';

const iconMap = {
  images: Images,
  folder: Folder,
  package: Package,
  'grid-3x3': Grid3X3,
  image: Image,
  'file-text': FileText,
  award: Award,
  user: User,
};

interface FolderSidebarProps {
  selectedFolder: string;
  onSelectFolder: (folder: string) => void;
}

export function FolderSidebar({ selectedFolder, onSelectFolder }: FolderSidebarProps) {
  return (
    <div className="w-44 border-r border-border bg-card/50 flex flex-col">
      <div className="py-2 px-3 border-b border-border">
        <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
          Folders
        </h3>
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-auto">
        {FOLDER_CONFIG.map(folder => {
          const Icon = iconMap[folder.icon as keyof typeof iconMap] || Folder;
          const isSelected = selectedFolder === folder.id;

          return (
            <button
              key={folder.id}
              onClick={() => onSelectFolder(folder.id)}
              className={cn(
                "w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm transition-all duration-150 group",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                  : "text-foreground hover:bg-accent"
              )}
            >
              <Icon className={cn(
                "h-4 w-4 shrink-0",
                isSelected ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
              )} />
              <span className="flex-1 text-left truncate">{folder.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
