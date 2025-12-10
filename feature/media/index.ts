// Media Feature
// BE types: import from '@/types/media.types'
// Platform API: import from '@/api/platform/media-api'

// Feature-specific exports only
export { MEDIA_FOLDERS, FOLDER_CONFIG } from './types';
export type { 
  UploadOptions, 
  UploadingFile, 
  MediaLibraryState,
  PaginationState,
  MediaItem,
  MediaUpdateData,
} from './types';

export * from './utils';

export { useMediaLibrary } from './hooks/useMediaLibrary';
export { useMediaUpload } from './hooks/useMediaUpload';

export { MediaLibrary } from './components/MediaLibrary';
export { MediaGrid } from './components/MediaGrid';
export { MediaUploader } from './components/MediaUploader';
export { MediaDetailPanel } from './components/MediaDetailPanel';
export { FolderSidebar } from './components/FolderSidebar';
