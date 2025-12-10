// @/api/platform/media-api.ts
import {
  type ApiResponse,
  type PaginatedResponse,
  type RequestOptions,
  type DeleteResponse,
} from "../api-factory";
import { handleApiRequest } from "../api-handler";
import type {
  Media,
  MediaFolder,
  MediaQueryParams,
  UpdateMediaPayload,
  BulkDeleteResult,
  MoveFilesPayload,
  MoveFilesResult,
} from "@/types/media.types";

type FetchOptions = Omit<RequestOptions, "token" | "organizationId">;

/**
 * Media API - Image upload and management
 *
 * Endpoints:
 * - POST /api/media/upload (single file upload)
 * - POST /api/media/upload-multiple (multiple files)
 * - GET /api/media (list with filters)
 * - GET /api/media/:id (get single)
 * - PATCH /api/media/:id (update alt/title)
 * - DELETE /api/media/:id (delete single)
 * - GET /api/media/folders (get allowed folders)
 *
 * Features:
 * - Auto WebP conversion
 * - Auto variants: thumbnail (150×200), medium (600×800), large (1200×1600)
 * - Max size: 50MB
 * - S3 storage with CDN
 *
 * Usage Examples:
 * - mediaApi.upload({ token: 'xxx', file, folder: 'products' })
 * - mediaApi.getAll({ params: { folder: 'products', limit: 20 }})
 * - mediaApi.update({ token: 'xxx', id: '123', data: { alt: 'New alt' }})
 * - mediaApi.delete({ token: 'xxx', id: '123' })
 */
class MediaApi {
  private readonly baseUrl: string;
  private readonly defaultCache: RequestCache;

  constructor(config: { basePath?: string; cache?: RequestCache } = {}) {
    this.baseUrl = `${config.basePath || "/api/v1"}/media`;
    this.defaultCache = config.cache || "no-store";
  }

  /**
   * Upload single file
   * POST /api/media/upload
   *
   * @example
   * const file = event.target.files[0];
   * const result = await mediaApi.upload({
   *   token: 'xxx',
   *   file,
   *   folder: 'products',
   *   alt: 'Product image'
   * });
   */
  async upload({
    token,
    file,
    folder,
    alt,
    title,
    options = {},
  }: {
    token: string;
    file: File | Blob;
    folder?: MediaFolder;
    alt?: string;
    title?: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<Media>> {
    const formData = new FormData();
    formData.append("file", file);
    if (folder) formData.append("folder", folder);
    if (alt) formData.append("alt", alt);
    if (title) formData.append("title", title);

    return handleApiRequest("POST", `${this.baseUrl}/upload`, {
      token,
      body: formData,
      cache: this.defaultCache,
      ...options,
    });
  }

  /**
   * Upload multiple files (max 20)
   * POST /api/media/upload-multiple
   *
   * @example
   * const files = Array.from(event.target.files);
   * const result = await mediaApi.uploadMultiple({
   *   token: 'xxx',
   *   files,
   *   folder: 'products'
   * });
   */
  async uploadMultiple({
    token,
    files,
    folder,
    options = {},
  }: {
    token: string;
    files: (File | Blob)[];
    folder?: MediaFolder;
    options?: FetchOptions;
  }): Promise<ApiResponse<Media[]>> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files[]", file));
    if (folder) formData.append("folder", folder);

    return handleApiRequest("POST", `${this.baseUrl}/upload-multiple`, {
      token,
      body: formData,
      cache: this.defaultCache,
      ...options,
    });
  }

  /**
   * Get all media with filtering
   * GET /api/media
   *
   * @example
   * const result = await mediaApi.getAll({
   *   token: 'xxx',
   *   params: {
   *     folder: 'products',
   *     search: 'shirt',
   *     limit: 20,
   *     sort: '-createdAt'
   *   }
   * });
   */
  async getAll({
    token,
    params = {},
    options = {},
  }: {
    token: string;
    params?: MediaQueryParams;
    options?: FetchOptions;
  } = {} as any): Promise<PaginatedResponse<Media>> {
    // Filter out undefined/null values before creating query string
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
    );
    const queryString = new URLSearchParams(
      cleanParams as Record<string, string>
    ).toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    return handleApiRequest("GET", url, {
      token,
      cache: this.defaultCache,
      ...options,
    });
  }

  /**
   * Get single media by ID
   * GET /api/media/:id
   *
   * @example
   * const result = await mediaApi.getById({ token: 'xxx', id: '123abc' });
   */
  async getById({
    token,
    id,
    options = {},
  }: {
    token: string;
    id: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<Media>> {
    if (!id) throw new Error("ID is required");

    return handleApiRequest("GET", `${this.baseUrl}/${id}`, {
      token,
      cache: this.defaultCache,
      ...options,
    });
  }

  /**
   * Update media metadata (alt, title)
   * PATCH /api/media/:id
   *
   * @example
   * await mediaApi.update({
   *   token: 'xxx',
   *   id: '123',
   *   data: { alt: 'New alt text', title: 'New title' }
   * });
   */
  async update({
    token,
    id,
    data,
    options = {},
  }: {
    token: string;
    id: string;
    data: UpdateMediaPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<Media>> {
    if (!id) throw new Error("ID is required");

    return handleApiRequest("PATCH", `${this.baseUrl}/${id}`, {
      token,
      body: data,
      cache: this.defaultCache,
      ...options,
    });
  }

  /**
   * Delete single media
   * DELETE /api/media/:id
   *
   * @example
   * await mediaApi.delete({ token: 'xxx', id: '123' });
   */
  async delete({
    token,
    id,
    options = {},
  }: {
    token: string;
    id: string;
    options?: FetchOptions;
  }): Promise<DeleteResponse> {
    if (!id) throw new Error("ID is required");

    return handleApiRequest("DELETE", `${this.baseUrl}/${id}`, {
      token,
      cache: this.defaultCache,
      ...options,
    });
  }

  /**
   * Bulk delete multiple files
   * POST /api/media/bulk-delete
   *
   * @example
   * await mediaApi.bulkDelete({
   *   token: 'xxx',
   *   ids: ['123', '456', '789']
   * });
   */
  async bulkDelete({
    token,
    ids,
    options = {},
  }: {
    token: string;
    ids: string[];
    options?: FetchOptions;
  }): Promise<ApiResponse<BulkDeleteResult>> {
    if (!ids.length) throw new Error("IDs array is required");

    return handleApiRequest("POST", `${this.baseUrl}/bulk-delete`, {
      token,
      body: { ids },
      cache: this.defaultCache,
      ...options,
    });
  }

  /**
   * Move files to different folder
   * POST /api/media/move
   *
   * @example
   * await mediaApi.moveToFolder({
   *   token: 'xxx',
   *   ids: ['123', '456'],
   *   targetFolder: 'banners'
   * });
   */
  async moveToFolder({
    token,
    data,
    options = {},
  }: {
    token: string;
    data: MoveFilesPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<MoveFilesResult>> {
    if (!data.ids.length) throw new Error("IDs array is required");
    if (!data.targetFolder) throw new Error("Target folder is required");

    return handleApiRequest("POST", `${this.baseUrl}/move`, {
      token,
      body: data,
      cache: this.defaultCache,
      ...options,
    });
  }

  /**
   * Get allowed folders
   * GET /api/media/folders
   *
   * @example
   * const result = await mediaApi.getFolders({ token: 'xxx' });
   * // result.data = ['general', 'products', 'categories', ...]
   */
  async getFolders({
    token,
    options = {},
  }: {
    token: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<MediaFolder[]>> {
    return handleApiRequest("GET", `${this.baseUrl}/folders`, {
      token,
      cache: this.defaultCache,
      ...options,
    });
  }

  /**
   * Helper: Get variant URL by name
   * Falls back to original URL if variant not found
   *
   * @example
   * const thumbnailUrl = mediaApi.getVariantUrl(media, 'thumbnail');
   * <img src={thumbnailUrl} />
   */
  getVariantUrl(media: Media, variantName: string): string {
    return (
      media.variants?.find((v) => v.name === variantName)?.url || media.url
    );
  }

  /**
   * Helper: Get thumbnail URL
   */
  getThumbnailUrl(media: Media): string {
    return this.getVariantUrl(media, "thumbnail");
  }

  /**
   * Helper: Get medium URL
   */
  getMediumUrl(media: Media): string {
    return this.getVariantUrl(media, "medium");
  }

}

// Create and export a singleton instance
export const mediaApi = new MediaApi();
export { MediaApi };
