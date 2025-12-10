// Media Feature Types
// BE types: import from '@/types/media.types'

import type { Media, MediaFolder } from '@/types/media.types';

// Static folders for UI (matches BE MediaFolder type)
export const MEDIA_FOLDERS = [
  'general',
  'products', 
  'categories',
  'blog',
  'users',
  'banners',
  'brands',
] as const;

// Folder display config for UI
export const FOLDER_CONFIG = [
  { id: 'all', name: 'All Media', icon: 'images' },
  { id: 'general', name: 'General', icon: 'folder' },
  { id: 'products', name: 'Products', icon: 'package' },
  { id: 'categories', name: 'Categories', icon: 'grid-3x3' },
  { id: 'banners', name: 'Banners', icon: 'image' },
  { id: 'blog', name: 'Blog', icon: 'file-text' },
  { id: 'users', name: 'Users', icon: 'user' },
  { id: 'brands', name: 'Brands', icon: 'award' },
] as const;

// Feature-specific types

export interface UploadOptions {
  folder?: MediaFolder;
  alt?: string;
  title?: string;
}

export interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

// Pagination state (matches API response)
export interface PaginationState {
  total: number;
  pages: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface MediaLibraryState {
  items: Media[];
  loading: boolean;
  selectedFolder: string;
  selectedIds: string[];
  viewMode: 'grid' | 'list';
  detailItem: Media | null;
  folderCounts: Record<string, number>;
  searchQuery: string;
  pagination: PaginationState;
}

// Alias for component compatibility
export type MediaItem = Media;
export type MediaUpdateData = { alt?: string; title?: string };
