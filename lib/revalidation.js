/**
 * Revalidation Utilities
 * Client-side functions to trigger Next.js cache revalidation
 */

/**
 * Base revalidation function
 * @param {Object} options - Revalidation options
 * @param {string} options.type - Revalidation type: 'path', 'tag', or 'both'
 * @param {string} [options.path] - Path to revalidate
 * @param {string[]} [options.tags] - Tags to revalidate
 * @param {string} [options.slug] - Optional slug for logging
 */
async function revalidate({ type = "both", path, tags, slug }) {
  try {
    await fetch("/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        ...(slug && { slug }),
        ...(tags && { tags }),
        ...(path && { path }),
      }),
    });
  } catch (error) {
    console.error("Revalidation error:", error);
  }
}

/**
 * Revalidate product cache after create/update
 * @param {string} slug - Product slug
 */
export async function revalidateProduct(slug) {
  if (!slug) {
    console.warn("Product slug is required for revalidation");
    return;
  }

  return revalidate({
    type: "both",
    slug: `products/${slug}`,
    tags: ["products", `product-${slug}`],
    path: `/products/${slug}`,
  });
}

/**
 * Revalidate all products listing pages
 */
export async function revalidateProductsList() {
  return revalidate({
    type: "both",
    tags: ["products"],
    path: "/products",
  });
}

/**
 * Revalidate category pages
 * @param {string} categorySlug - Category slug
 */
export async function revalidateCategory(categorySlug) {
  if (!categorySlug) {
    console.warn("Category slug is required for revalidation");
    return;
  }

  return revalidate({
    type: "both",
    tags: ["products", `category-${categorySlug}`],
    path: `/products/category/${categorySlug}`,
  });
}

/**
 * Revalidate order cache after status update
 * @param {string} orderId - Order ID
 */
export async function revalidateOrder(orderId) {
  if (!orderId) {
    console.warn("Order ID is required for revalidation");
    return;
  }

  return revalidate({
    type: "both",
    tags: ["orders", `order-${orderId}`],
    path: `/dashboard/orders/${orderId}`,
  });
}

/**
 * Revalidate all orders listing
 */
export async function revalidateOrdersList() {
  return revalidate({
    type: "tag",
    tags: ["orders"],
  });
}

/**
 * Revalidate user profile
 * @param {string} userId - User ID
 */
export async function revalidateUserProfile(userId) {
  if (!userId) {
    console.warn("User ID is required for revalidation");
    return;
  }

  return revalidate({
    type: "both",
    tags: ["users", `user-${userId}`],
    path: `/dashboard/users/${userId}`,
  });
}

/**
 * Revalidate home page
 */
export async function revalidateHomePage() {
  return revalidate({
    type: "both",
    tags: ["home"],
    path: "/",
  });
}

/**
 * Revalidate dashboard pages
 */
export async function revalidateDashboard() {
  return revalidate({
    type: "tag",
    tags: ["dashboard"],
  });
}
