// @/api/platform/size-guide-api.ts
import { BaseApi, type ApiResponse, type RequestOptions } from '../api-factory';
import { handleApiRequest } from '../api-handler';
import type {
  SizeGuide,
  CreateSizeGuidePayload,
  UpdateSizeGuidePayload,
} from '@/types/size-guide.types';

type FetchOptions = Omit<RequestOptions, 'token' | 'organizationId'>;

/**
 * Size Guide API Client
 *
 * **Authentication:**
 * - Public: List, Get, GetBySlug
 * - Admin: Create, Update, Delete
 *
 * **Base URL:** `/api/v1/size-guides`
 *
 * **Slug-Based Design:**
 * - Size guides use slugs as identifiers
 * - Products store `sizeGuideSlug` to reference a size guide
 *
 * **Standard CRUD (inherited from BaseApi):**
 * - `getAll({ token, params })` - List with filtering/search/pagination
 * - `getById({ token, id })` - Get by ID
 * - `create({ token, data })` - Create new size guide (admin)
 * - `update({ token, id, data })` - Update size guide (admin)
 * - `delete({ token, id })` - Delete size guide (admin)
 *
 * **Custom Endpoints:**
 * - `getBySlug({ token, slug })` - GET /size-guides/slug/:slug
 *
 * @see {@link file://d:/projects/ecom/bigboss/fe-prod/docs/api/commerce/size-guide.md Size Guide API Guide}
 */
class SizeGuideApi extends BaseApi<SizeGuide, CreateSizeGuidePayload, UpdateSizeGuidePayload> {
  constructor(config = {}) {
    super('size-guides', config);
  }

  /**
   * Get size guide by slug
   * GET /size-guides/slug/:slug
   *
   * For product detail pages to fetch the appropriate size guide.
   *
   * @param token - Auth token (optional, public endpoint)
   * @param slug - Size guide slug (e.g., "t-shirts-tops")
   * @param options - Additional fetch options
   * @returns Size guide object
   *
   * @example
   * ```typescript
   * const { data } = await sizeGuideApi.getBySlug({
   *   token: null,
   *   slug: 't-shirts-tops'
   * });
   * ```
   */
  async getBySlug({
    token = null,
    slug,
    options = {},
  }: {
    token?: string | null;
    slug: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<SizeGuide>> {
    if (!slug) {
      throw new Error('Size guide slug is required');
    }

    return handleApiRequest('GET', `${this.baseUrl}/slug/${slug}`, {
      token,
      cache: this.config.cache,
      ...options,
    });
  }
}

// Create and export a singleton instance
export const sizeGuideApi = new SizeGuideApi();
export { SizeGuideApi };
