import { BaseApi } from '@/api/api-factory';
import { Product, ProductPayload } from '@/types/product.types';

/**
 * Product API Client
 * Extends BaseApi with product-specific endpoints
 */
class ProductApi extends BaseApi<Product, ProductPayload, ProductPayload> {
  /**
   * Get product by slug
   * (Public endpoint)
   */
  async getBySlug(slug: string, options = {}) {
    return this.request<any>('GET', `${this.baseUrl}/slug/${slug}`, {
      ...options,
    });
  }

  /**
   * Get product recommendations
   * (Public endpoint)
   */
  async getRecommendations(productId: string, options = {}) {
    return this.request<any>('GET', `${this.baseUrl}/${productId}/recommendations`, {
      ...options,
    });
  }

  /**
   * Get soft-deleted products (Recycle Bin)
   * (Admin only)
   */
  async getDeleted(params = {}, options = {}) {
    return this.request<any>('GET', `${this.baseUrl}/deleted`, {
      params,
      ...options,
    });
  }

  /**
   * Restore a soft-deleted product
   * (Admin only)
   */
  async restore(id: string, options = {}) {
    return this.request<any>('POST', `${this.baseUrl}/${id}/restore`, {
      ...options,
    });
  }

  /**
   * Permanently delete a product (Hard delete)
   * (Admin only - use with caution)
   */
  async hardDelete(id: string, options = {}) {
    return this.delete({
      id,
      options: {
        ...options,
        // @ts-ignore
        params: { hard: 'true' }
      }
    });
  }
}

/**
 * Export singleton instance
 */
export const productApi = new ProductApi('products');
export default productApi;
