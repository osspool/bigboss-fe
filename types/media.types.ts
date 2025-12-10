// @/api/platform/media.types.ts

/**
 * Media Types
 * Simple types for media upload, management, and retrieval
 */

// ============ Enums/Unions ============

/**
 * Allowed media folders
 */
export type MediaFolder =
  | "general"
  | "products"
  | "categories"
  | "blog"
  | "users"
  | "banners"
  | "brands";

/**
 * Image variant names
 */
export type VariantName = "thumbnail" | "medium" | "large";

// ============ Interfaces ============

/**
 * Image dimensions
 */
export interface MediaDimensions {
  width: number;
  height: number;
}

/**
 * Image variant (resized version)
 */
export interface MediaVariant {
  name: VariantName;
  url: string;
  width: number;
  height: number;
}

/**
 * Media document (image file with metadata)
 */
export interface Media {
  _id: string;
  url: string;
  filename: string;
  folder: MediaFolder;
  alt?: string;
  title?: string;
  size: number; // bytes
  dimensions: MediaDimensions;
  variants?: MediaVariant[];
  contentType?: string;
  createdAt: string;
  updatedAt?: string;
}

// ============ Request/Response Payloads ============

/**
 * Upload single file payload
 */
export interface UploadPayload {
  file: File | Blob;
  folder?: MediaFolder;
  alt?: string;
  title?: string;
}

/**
 * Upload multiple files payload
 */
export interface UploadMultiplePayload {
  files: (File | Blob)[];
  folder?: MediaFolder;
}

/**
 * Update media payload
 */
export interface UpdateMediaPayload {
  alt?: string;
  title?: string;
}

/**
 * Bulk delete payload
 */
export interface BulkDeletePayload {
  ids: string[];
}

/**
 * Move files payload
 */
export interface MoveFilesPayload {
  ids: string[];
  targetFolder: MediaFolder;
}

/**
 * Query parameters for media listing
 */
export interface MediaQueryParams {
  // Pagination
  page?: number;
  limit?: number;

  // Filters
  folder?: MediaFolder;
  search?: string; // Search filename, alt, title

  // Sort
  sort?: string; // e.g., '-createdAt'
}

/**
 * Bulk delete result
 */
export interface BulkDeleteResult {
  success: string[];
  failed: string[];
}

/**
 * Move files result
 */
export interface MoveFilesResult {
  modifiedCount: number;
}
