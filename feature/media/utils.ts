// Media Feature Utilities
// Uses BE-provided types from @/types/media.types.ts

import type { Media, VariantName } from '@/types/media.types';

/**
 * Get variant URL from media item
 */
export function getVariantUrl(
  media: Media,
  variant: VariantName
): string {
  return media.variants?.find(v => v.name === variant)?.url || media.url;
}

/**
 * Get the best variant for thumbnails (smallest available)
 * Tries: thumbnail -> medium -> original
 */
export function getThumbnailUrl(media: Media): string {
  if (!media.variants || media.variants.length === 0) {
    return media.url;
  }

  // Try thumbnail first
  const thumbnail = media.variants.find(v => v.name === 'thumbnail');
  if (thumbnail) return thumbnail.url;

  // Then try medium
  const medium = media.variants.find(v => v.name === 'medium');
  if (medium) return medium.url;

  // Fallback to original
  return media.url;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format date for display
 */
export function formatMediaDate(dateString: string | undefined): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Filter files to only images
 */
export function filterImageFiles(files: FileList | File[]): File[] {
  return Array.from(files).filter(f => f.type.startsWith('image/'));
}

/**
 * Create a media item from URL (for external images)
 */
export function createMediaFromUrl(url: string): Media {
  return {
    _id: `url-${Date.now()}`,
    filename: url.split('/').pop() || 'external-image',
    url,
    folder: 'general',
    size: 0,
    dimensions: { width: 0, height: 0 },
    createdAt: new Date().toISOString(),
  };
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
