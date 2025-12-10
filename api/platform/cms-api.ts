/**
 * CMS API - Slug-based content management
 * 
 * Two endpoints only:
 * - GET  /api/v1/cms/:slug - Fetch page (public)
 * - PATCH /api/v1/cms/:slug - Update page (admin, auto-creates if missing)
 */

import { handleApiRequest } from "../api-handler";
import type { ApiResponse, RequestOptions } from "../api-factory";
import type { CMSPage, CMSPagePayload } from "@/types/cms.types";

const CMS_BASE = "/api/v1/cms";

/**
 * Get CMS page by slug (public)
 * Returns page data or null if not found
 * Gracefully handles 404 errors by returning null instead of throwing
 */
export async function getCmsPage({
  slug,
  options = {},
}: {
  slug: string;
  options?: RequestOptions;
}): Promise<ApiResponse<CMSPage | null>> {
  if (!slug) throw new Error("Slug is required");

  try {
    return await handleApiRequest<ApiResponse<CMSPage | null>>(
      "GET",
      `${CMS_BASE}/${slug}`,
      options
    );
  } catch (error) {
    // If document not found (404), return null data gracefully
    if (error instanceof Error && error.message.includes("Document not found")) {
      return {
        success: false,
        data: null,
        message: "CMS page not found, using static fallback",
      };
    }
    // Re-throw other errors (network issues, server errors, etc.)
    throw error;
  }
}

/**
 * Update CMS page by slug (admin)
 * Backend auto-creates if page doesn't exist
 */
export async function updateCmsPage({
  slug,
  token,
  data,
  options = {},
}: {
  slug: string;
  token: string;
  data: CMSPagePayload;
  options?: RequestOptions;
}): Promise<ApiResponse<CMSPage>> {
  if (!slug) throw new Error("Slug is required");

  return handleApiRequest<ApiResponse<CMSPage>>(
    "PATCH",
    `${CMS_BASE}/${slug}`,
    { token, body: data, ...options }
  );
}
