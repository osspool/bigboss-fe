// @/api/platform/category-api.ts
import { BaseApi, type ApiResponse, type RequestOptions } from '../api-factory';
import { handleApiRequest } from '../api-handler';
import type {
  Category,
  CategoryTreeNode,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CategoryTreeResponse,
} from '@/types/category.types';

type FetchOptions = Omit<RequestOptions, 'token' | 'organizationId'>;

/**
 * Category API Client
 *
 * **Authentication:**
 * - Public: List, Get, Tree, GetBySlug
 * - Admin: Create, Update, Delete
 *
 * **Base URL:** `/api/v1/categories`
 *
 * **Slug-Based Design:**
 * - Categories use slugs as identifiers (not ObjectIds)
 * - Products store category as slug string for fast queries
 * - Example: `db.products.find({ category: "electronics" })`
 *
 * **Standard CRUD (inherited from BaseApi):**
 * - `getAll({ token, params })` - List with filtering/search/pagination
 * - `getById({ token, id })` - Get by ID
 * - `create({ token, data })` - Create new category (admin)
 * - `update({ token, id, data })` - Update category (admin)
 * - `delete({ token, id })` - Delete category (admin, fails if products exist)
 *
 * **Custom Endpoints:**
 * - `getTree({ token })` - GET /categories/tree (nested structure - **FE should cache this!**)
 * - `getBySlug({ token, slug })` - GET /categories/slug/:slug
 *
 * @see {@link file://d:/projects/ecom/bigboss/fe-prod/docs/api/commerce/category.md Category API Guide}
 */
class CategoryApi extends BaseApi<Category, CreateCategoryPayload, UpdateCategoryPayload> {
  constructor(config = {}) {
    super('categories', config);
  }

  /**
   * Get category tree (nested structure)
   * GET /categories/tree
   *
   * **This is the main endpoint - FE should cache this and derive everything else from it.**
   *
   * Returns nested tree structure with children. Use helper functions from
   * `@/hooks/query/useCategories` to flatten, search, or extract children.
   *
   * @param token - Auth token (optional, public endpoint)
   * @param options - Additional fetch options
   * @returns Nested category tree
   *
   * @example
   * ```typescript
   * const { data } = await categoryApi.getTree({ token: null });
   * // data = [{ slug: "clothing", name: "Clothing", children: [...] }]
   * ```
   *
   * @see {@link file://d:/projects/ecom/bigboss/fe-prod/hooks/query/useCategories.js#useCategoryTree useCategoryTree Hook}
   */
  async getTree({
    token = null,
    options = {},
  }: {
    token?: string | null;
    options?: FetchOptions;
  }): Promise<CategoryTreeResponse> {
    return handleApiRequest('GET', `${this.baseUrl}/tree`, {
      token,
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Get category by slug
   * GET /categories/slug/:slug
   *
   * For URL resolution when you need full category details.
   *
   * @param token - Auth token (optional, public endpoint)
   * @param slug - Category slug (e.g., "electronics", "t-shirts")
   * @param options - Additional fetch options
   * @returns Category object
   *
   * @example
   * ```typescript
   * const { data } = await categoryApi.getBySlug({
   *   token: null,
   *   slug: 'electronics'
   * });
   * ```
   *
   * @see {@link file://d:/projects/ecom/bigboss/fe-prod/hooks/query/useCategories.js#useCategoryBySlug useCategoryBySlug Hook}
   */
  async getBySlug({
    token = null,
    slug,
    options = {},
  }: {
    token?: string | null;
    slug: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<Category>> {
    if (!slug) {
      throw new Error('Category slug is required');
    }

    return handleApiRequest('GET', `${this.baseUrl}/slug/${slug}`, {
      token,
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Sync product counts for all categories
   * POST /categories/sync-product-count
   *
   * Recalculates `productCount` for all categories based on current products.
   * Use when manual data fixes or migrations may have desynced counts.
   *
   * @param token - Auth token (admin or inventory staff required)
   * @param options - Additional fetch options
   * @returns Number of categories updated
   *
   * @example
   * ```typescript
   * const { data } = await categoryApi.syncProductCount({ token });
   * // data = { updated: 42 }
   * ```
   */
  async syncProductCount({
    token,
    options = {},
  }: {
    token: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<{ updated: number }>> {
    return handleApiRequest('POST', `${this.baseUrl}/sync-product-count`, {
      token,
      ...options,
    });
  }
}

// Create and export a singleton instance
export const categoryApi = new CategoryApi();
export { CategoryApi };
