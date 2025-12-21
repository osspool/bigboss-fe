export function makeLineKey(productId: string, variantSku?: string) {
  return `${productId}:${variantSku || ""}`;
}

