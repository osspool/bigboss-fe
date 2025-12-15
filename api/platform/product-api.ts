// @/api/platform/product-api.ts
import { BaseApi, type ApiResponse, type RequestOptions } from "../api-factory";
import { handleApiRequest } from "../api-handler";
import type { Product, ProductPayload } from "@/types/product.types";

type FetchOptions = Omit<RequestOptions, "token" | "organizationId">;

/**
 * Product API - Typed CRUD + Custom Endpoints
 *
 * Uses BaseApi for standard CRUD. Only custom endpoints defined here.
 * No organization/multi-tenancy - uses default BaseApi behavior.
 *
 * Standard CRUD (inherited from BaseApi):
 * - getAll({ params }) - list with filtering, search, pagination
 * - getById({ id }) - get by ID
 * - create({ token, data }) - admin only
 * - update({ token, id, data }) - admin only
 * - delete({ token, id }) - admin only
 *
 * Custom Endpoints:
 * - getBySlug({ slug }) - SEO-friendly lookup
 * - getRecommendations({ productId }) - related products
 *
 * Usage:
 * - productApi.getAll({ params: { category: 'mens', 'basePrice[lte]': 1000 }})
 * - productApi.getBySlug({ slug: 'cool-tshirt' })
 */
class ProductApi extends BaseApi<Product, ProductPayload, ProductPayload> {
  constructor(config = {}) {
    super("products", config);
  }

  /**
   * Get product by slug (SEO-friendly URL)
   * GET /products/slug/:slug
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
