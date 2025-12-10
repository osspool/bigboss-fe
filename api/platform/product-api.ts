// @/api/platform/product-api.ts
import {
  BaseApi,
  type ApiResponse,
  type PaginatedResponse,
  type RequestOptions,
} from "../api-factory";
import { handleApiRequest } from "../api-handler";
import type {
  Product,
  ProductPayload,
  ProductQueryParams,
} from "@/types/product.types";

type FetchOptions = Omit<RequestOptions, "token" | "organizationId">;

/**
 * Product API - CRUD + Custom Endpoints
 *
 * Endpoints:
 * - GET /products (list with filtering, search, pagination)
 * - GET /products/:id (by ID)
 * - GET /products/slug/:slug (by slug)
 * - GET /products/:productId/recommendations (related products)
 * - POST /products (admin only)
 * - PATCH /products/:id (admin only)
 * - DELETE /products/:id (admin only)
 *
 * Pagination:
 * - Offset: ?page=1&limit=24 → { docs, total, pages, page, hasNext, hasPrev }
 * - Keyset: ?sort=-createdAt&limit=20 → { docs, hasMore, next }
 *
 * Usage Examples:
 * - productApi.getAll({ params: { category: 'mens', basePrice[lte]: 1000 }})
 * - productApi.getAll({ params: { search: 'shirt', sort: '-createdAt' }})
 * - productApi.getBySlug({ slug: 'cool-tshirt' })
 * - productApi.getRecommendations({ productId: '123' })
 * - productApi.create({ token: 'xxx', data: {...} })
 */
class ProductApi extends BaseApi<Product, ProductPayload, ProductPayload> {
  constructor(config = {}) {
    super("products", config);
  }

  /**
   * Get all products with filtering
   * @example
   * productApi.getAll({
   *   params: {
   *     category: 'mens',
   *     style: ['casual', 'street'],
   *     'basePrice[gte]': 500,
   *     'basePrice[lte]': 2000,
   *     search: 'shirt',
   *     sort: '-createdAt',
   *     select: 'name,slug,basePrice,images',
   *     limit: 24
   *   }
   * })
   */
  async getAll({
    token = null,
    organizationId = null,
    params = {},
    options = {},
  }: {
    token?: string | null;
    organizationId?: string | null;
    params?: ProductQueryParams;
    options?: FetchOptions;
  } = {}): Promise<PaginatedResponse<Product>> {
    return super.getAll({ token, organizationId, params, options });
  }

  /**
   * Get product by slug (SEO-friendly URL)
   * GET /products/slug/:slug
   *
   * @example
   * productApi.getBySlug({ slug: 'cool-graphic-tshirt' })
   */
  async getBySlug({
    slug,
    options = {},
  }: {
    slug: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<Product>> {
    if (!slug) {
      throw new Error("Slug is required");
    }

    return handleApiRequest("GET", `${this.baseUrl}/slug/${slug}`, {
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Get product recommendations
   * GET /products/:productId/recommendations
   *
   * Returns up to 4 products from the same category, sorted by total sales
   *
   * @example
   * productApi.getRecommendations({ productId: '123abc' })
   */
  async getRecommendations({
    productId,
    options = {},
  }: {
    productId: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<Product[]>> {
    if (!productId) {
      throw new Error("Product ID is required");
    }

    return handleApiRequest(
      "GET",
      `${this.baseUrl}/${productId}/recommendations`,
      {
        cache: this.config.cache,
        ...options,
      }
    );
  }
}

// Create and export a singleton instance
export const productApi = new ProductApi();
export { ProductApi };
