/**
 * Barcode generation utilities for POS system
 * Generates industry-standard EAN-13 and CODE128 barcodes
 */

/**
 * Generate UPC-A barcode with check digit
 * UPC-A format: 11 digits + 1 check digit = 12 digits total
 */
export function generateUPCA(seed: string): string {
  // Extract numeric characters and pad/truncate to 11 digits
  const numeric = seed.replace(/[^0-9]/g, "");
  const base = numeric.padStart(11, "0").slice(0, 11);

  // Calculate check digit
  const digits = base.split("").map(Number);
  let sum = 0;

  for (let i = 0; i < 11; i++) {
    sum += digits[i] * (i % 2 === 0 ? 3 : 1);
  }

  const checkDigit = (10 - (sum % 10)) % 10;

  return base + checkDigit;
}

/**
 * Generate EAN-13 barcode with check digit
 * EAN-13 format: 12 digits + 1 check digit
 */
export function generateEAN13(seed: string): string {
  // Extract numeric characters and pad/truncate to 12 digits
  const numeric = seed.replace(/[^0-9]/g, "");
  const base = numeric.padStart(12, "0").slice(0, 12);

  // Calculate check digit
  const digits = base.split("").map(Number);
  let sum = 0;

  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }

  const checkDigit = (10 - (sum % 10)) % 10;

  return base + checkDigit;
}

/**
 * Validate EAN-13 barcode
 */
export function validateEAN13(barcode: string): boolean {
  if (!/^\d{13}$/.test(barcode)) return false;

  const digits = barcode.split("").map(Number);
  const checksum = digits.pop()!;

  const sum = digits.reduce((acc, digit, i) => acc + digit * (i % 2 === 0 ? 1 : 3), 0);

  const calculatedChecksum = (10 - (sum % 10)) % 10;
  return checksum === calculatedChecksum;
}

/**
 * Generate barcode from product SKU or name
 * Uses current timestamp + hash for uniqueness
 * @param sku Product SKU
 * @param variant Optional variant string
 * @param format Barcode format (EAN13, UPCA, or CODE128)
 */
export function generateBarcodeFromSKU(sku: string, variant?: string, format: "EAN13" | "UPCA" | "CODE128" = "EAN13"): string {
  // Create a seed from SKU and variant
  const seed = variant ? `${sku}${variant}` : sku;

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Get absolute value and ensure it's positive
  const hashStr = Math.abs(hash).toString().padStart(9, "0");

  // Add timestamp component for uniqueness (last 3 digits of timestamp)
  const timestamp = Date.now().toString().slice(-3);

  if (format === "EAN13") {
    // Combine to create 12-digit base for EAN-13
    const base12 = (hashStr + timestamp).slice(0, 12);
    return generateEAN13(base12);
  } else if (format === "UPCA") {
    // Combine to create 11-digit base for UPC-A
    const base11 = (hashStr + timestamp).slice(0, 11);
    return generateUPCA(base11);
  } else {
    // CODE128 - alphanumeric
    return generateCODE128(seed, 12);
  }
}

/**
 * Generate CODE128 compatible barcode (alphanumeric)
 * For more flexibility than EAN-13
 */
export function generateCODE128(seed: string, length: number = 12): string {
  // Use alphanumeric characters
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  // Create hash from seed
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  // Generate barcode
  let barcode = "";
  let hashCopy = Math.abs(hash);

  for (let i = 0; i < length; i++) {
    barcode += chars[hashCopy % chars.length];
    hashCopy = Math.floor(hashCopy / chars.length);
    if (hashCopy === 0) {
      hashCopy = Math.abs(hash + i);
    }
  }

  return barcode;
}

/**
 * Format barcode for display (adds spacing)
 */
export function formatBarcodeDisplay(barcode: string): string {
  if (barcode.length === 13) {
    // EAN-13 format: X-XXXXXX-XXXXXX-X
    return `${barcode.slice(0, 1)}-${barcode.slice(1, 7)}-${barcode.slice(7, 13)}`;
  }
  return barcode;
}

/**
 * Generate barcode based on product type
 */
export function generateProductBarcode(
  sku: string,
  variant?: { size?: string; color?: string; [key: string]: string | undefined },
  format: "EAN13" | "UPCA" | "CODE128" = "EAN13"
): string {
  if (variant) {
    // For variants, include variant attributes in seed
    const variantStr = Object.values(variant).filter(Boolean).join("-");
    return generateBarcodeFromSKU(sku, variantStr, format);
  }

  // For simple products
  return generateBarcodeFromSKU(sku, undefined, format);
}
