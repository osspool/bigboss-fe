/**
 * Commerce SDK - Server-safe initialization
 *
 * Import this file anywhere you need the SDK on the server:
 * - Server Components
 * - Server Actions
 * - API Routes
 *
 * For client components with hooks, import from '@/hooks/query' instead.
 *
 * @example
 * import { sdk, productApi } from '@/lib/sdk';
 *
 * // Use the full SDK client
 * const products = await sdk.product.getAll({ params: { page: 1 } });
 *
 * // Or use individual APIs directly
 * const products = await productApi.getAll({ params: { page: 1 } });
 */

// Import from server entry point (no React hooks, server-safe)
import {
  createCommerceSDK,
  // APIs
  productApi,
  categoryApi,
  orderApi,
  customerApi,
  cartApi,
  branchApi,
  mediaApi,
  stockApi,
  purchaseApi,
  transferApi,
  adjustmentApi,
  transactionApi,
  // CMS
  getCmsPage,
  updateCmsPage,
  // Auth
  forgetPassApi,
  resetPassApi,
  authApi,
  // Core
  handleApiRequest,
} from '@classytic/commerce-sdk/server';

// Initialize SDK once at module load time
// This works for both server and client since NEXT_PUBLIC_ vars are available everywhere
const sdk = createCommerceSDK({
  baseUrl: process.env.NEXT_PUBLIC_API_URL!,
});

// Export the configured SDK client
export { sdk };

// Re-export commonly used APIs for convenience
export {
  productApi,
  categoryApi,
  orderApi,
  customerApi,
  cartApi,
  branchApi,
  mediaApi,
  stockApi,
  purchaseApi,
  transferApi,
  adjustmentApi,
  transactionApi,
  // CMS
  getCmsPage,
  updateCmsPage,
  // Auth
  forgetPassApi,
  resetPassApi,
  authApi,
  // Core
  handleApiRequest,
};
