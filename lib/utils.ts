import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Image } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ==================== Image Utils ====================

type ImageSize = "thumbnail" | "medium" | "full";

/**
 * Get the optimal image URL based on requested size
 * Priority: requested size variant -> smaller variant -> full url
 *
 * @param image - Image object with url and optional variants
 * @param size - Preferred size: "thumbnail" | "medium" | "full"
 * @returns The best available image URL or undefined if no image
 *
 * @example
 * // For small displays (avatars, table cells, thumbnails)
 * getImageUrl(product.featuredImage, "thumbnail")
 *
 * // For medium displays (cards, grids)
 * getImageUrl(product.featuredImage, "medium")
 *
 * // For full-size displays (galleries, hero images)
 * getImageUrl(product.featuredImage, "full")
 */
export function getImageUrl(image: Image | undefined | null, size: ImageSize = "full"): string | undefined {
  if (!image) return undefined;

  const { url, variants } = image;

  switch (size) {
    case "thumbnail":
      // Prefer thumbnail, fallback to medium, then full
      return variants?.thumbnail || variants?.medium || url;
    case "medium":
      // Prefer medium, fallback to thumbnail (if larger not available), then full
      return variants?.medium || variants?.thumbnail || url;
    case "full":
    default:
      // Always return full URL
      return url;
  }
}

/**
 * Get the best thumbnail URL from a product's images
 * Checks featuredImage first, then falls back to first image in array
 *
 * @param featuredImage - The product's featured image
 * @param images - Array of product images
 * @param size - Preferred size (default: "thumbnail")
 * @returns The best available image URL or undefined
 *
 * @example
 * const imageUrl = getProductImageUrl(product.featuredImage, product.images, "thumbnail");
 */
export function getProductImageUrl(
  featuredImage: Image | undefined | null,
  images: Image[] | undefined | null,
  size: ImageSize = "thumbnail"
): string | undefined {
  // Try featured image first
  const featuredUrl = getImageUrl(featuredImage, size);
  if (featuredUrl) return featuredUrl;

  // Fall back to first image in array
  const firstImage = images?.[0];
  return getImageUrl(firstImage, size);
}


/**
 * Converts MongoDB ObjectId or any ID to string
 * @param {*} id - ID value (can be ObjectId, string, or null/undefined)
 * @returns {string} String representation of the ID or empty string
 */
export function getIdString(id: any) {
  if (!id) return "";
  if (typeof id === "string") return id;
  if (typeof id === "object" && id.toString) return id.toString();
  return String(id);
}

export const copyToClipboard = async (value: string, options: { showToast?: boolean, successMessage?: string, errorMessage?: string } = {}) => {
  const {
      showToast = true,
      successMessage = "Copied to clipboard",
      errorMessage = "Failed to copy"
  } = options;

  if (!value) return false;

  try {
      await navigator.clipboard.writeText(value);
      
      if (showToast) {
          // Dynamic import to avoid issues if toast is not available
          const { toast } = await import("sonner");
          toast.success(successMessage);
      }
      
      return true;
  } catch (err) {
      console.error("Failed to copy text: ", err);
      
      if (showToast) {
          // Dynamic import to avoid issues if toast is not available
          const { toast } = await import("sonner");
          toast.error(errorMessage);
      }
      
      return false;
  }
};

/**
 * Maps a general order/subscription status to a Badge variant
 * Supported variants: 'default' | 'secondary' | 'destructive' | 'outline'
 */
export function getStatusColor(status: string) {
  const normalized = String(status || "").toLowerCase();

  switch (normalized) {
    case "paid":
    case "active":
    case "fulfilled":
      return "default";

    case "pending":
    case "processing":
      return "secondary";

    case "cancelled":
    case "canceled":
      return "destructive";

    case "refunded":
    default:
      return "outline";
  }
}

/**
 * Maps payment-specific statuses to a Badge variant
 * Examples: paid, pending, failed, refunded, partially_refunded, authorized, captured, voided, disputed, cancelled
 */
export function getPaymentStatusColor(status: string) {
  const normalized = String(status || "").toLowerCase();

  switch (normalized) {
    case "paid":
    case "captured":
      return "default";

    case "pending":
    case "authorized":
    case "partially_refunded":
      return "secondary";

    case "failed":
    case "disputed":
    case "cancelled":
    case "canceled":
      return "destructive";

    case "refunded":
    case "voided":
    case "expired":
    case "draft":
    default:
      return "outline";
  }
}


export function generateStableKey(item: any, index: number, prefix: string = "item") {
  if (item === null || item === undefined) {
    return `${prefix}-${index}`;
  }

  if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") {
    return `${prefix}-${String(item)}-${index}`;
  }

  if (Array.isArray(item)) {
    return `${prefix}-array-${index}`;
  }

  if (typeof item === "object") {
    const candidate =
      item.id ??
      item.slug ??
      item.key ??
      item.value ??
      item.title ??
      item.heading ??
      item.label ??
      item.name ??
      item.url ??
      item.href;

    if (candidate) {
      // Always include index to ensure uniqueness when items are duplicated
      return `${prefix}-${String(candidate)}-${index}`;
    }
  }

  return `${prefix}-${index}`;
}
