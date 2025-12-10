import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/api/platform/product-api";
import { createCrudHooks } from "@/hooks/factories";

// Create standard CRUD hooks
const { KEYS, useList, useDetail, useActions, useNavigation } = createCrudHooks({
  api: productApi,
  entityKey: "products",
  singular: "Product",
  plural: "Products",
  defaults: {
    staleTime: 5 * 60 * 1000, // 5 minutes - products don't change often
    messages: {
      createSuccess: "Product created successfully",
      updateSuccess: "Product updated successfully",
      deleteSuccess: "Product deleted successfully",
    },
  },
});

// Extend KEYS with custom query keys
const PRODUCT_KEYS = {
  ...KEYS,
  detailBySlug: (slug) => ["products", "detail", "slug", slug],
  recommendations: (productId) => ["products", "recommendations", productId],
};

/**
 * Get product by slug (custom endpoint)
 * @param {string} slug - Product slug
 * @param {Object} options - Query options
 */
export function useProductBySlug(slug, options = {}) {
  const { data, isLoading, error } = useQuery({
    queryKey: PRODUCT_KEYS.detailBySlug(slug),
    queryFn: () => productApi.getBySlug({ slug }),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

  return { product: data?.data ?? data, isLoading, error };
}

/**
 * Get product recommendations
 * @param {string} productId - Product ID
 * @param {Object} options - Query options
 */
export function useProductRecommendations(productId, options = {}) {
  const { data, isLoading, error } = useQuery({
    queryKey: PRODUCT_KEYS.recommendations(productId),
    queryFn: () => productApi.getRecommendations({ productId }),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

  return { recommendations: data?.data ?? [], isLoading, error };
}

// Export standard hooks
// useProducts = useList - use with params for filtering, search, pagination
// Example: useProducts(null, { search: 'keyword', category: 'men', page: 1, limit: 24, sort: '-createdAt' }, { public: true })
export {
  PRODUCT_KEYS,
  useList as useProducts,
  useDetail as useProductDetail,
  useActions as useProductActions,
  useNavigation as useProductNavigation,
};
