import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
