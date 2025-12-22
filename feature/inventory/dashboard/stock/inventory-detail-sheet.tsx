"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { SheetWrapper } from "@/components/custom/ui/sheet-wrapper";
import { formatPrice } from "@/lib/constants";
import { formatVariantAttributes } from "@/lib/commerce-utils";
import { cn } from "@/lib/utils";
import type { PosProduct, VariantStock } from "@/types/pos.types";

const LOW_STOCK_THRESHOLD = 10;

const formatMaybeNumber = (value?: number | null) => {
  if (value === null || value === undefined) return "-";
  return value.toString();
};

const formatPriceMaybe = (value?: number | null) => {
  if (value === null || value === undefined) return "-";
  return formatPrice(value);
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("en-GB");
};

function DetailRow({
  label,
  value,
  monospace = false,
}: {
  label: string;
  value?: ReactNode;
  monospace?: boolean;
}) {
  const hasValue = value !== null && value !== undefined && value !== "";
  const displayValue = hasValue ? value : "-";

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className={cn("text-sm font-semibold", monospace && "font-mono")}>{displayValue}</div>
    </div>
  );
}

const getStockBadge = (quantity: number, lowStock?: boolean, inStock?: boolean) => {
  const isOut = quantity === 0 || inStock === false;
  const isLow = lowStock || quantity <= LOW_STOCK_THRESHOLD;

  if (isOut) {
    return (
      <Badge variant="destructive" className="gap-1">
        Out
      </Badge>
    );
  }

  if (isLow) {
    return (
      <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/30">
        Low
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
      OK
    </Badge>
  );
};

type InventoryDetail = PosProduct & { id?: string };

type VariantRow = {
  sku: string;
  attributes?: Record<string, string>;
  quantity?: number;
  priceModifier?: number | null;
  costPrice?: number | null;
  barcode?: string;
  isActive?: boolean;
};

const buildVariantRows = (
  variants: PosProduct["variants"],
  branchVariants: VariantStock[]
) => {
  const branchVariantMap = new Map(branchVariants.map((variant) => [variant.sku, variant]));
  const rows: VariantRow[] = [];

  (variants || []).forEach((variant) => {
    const branchVariant = branchVariantMap.get(variant.sku);
    rows.push({
      sku: variant.sku,
      attributes: variant.attributes,
      quantity: branchVariant?.quantity,
      priceModifier: branchVariant?.priceModifier ?? variant.priceModifier,
      costPrice: branchVariant?.costPrice ?? variant.costPrice,
      barcode: variant.barcode,
      isActive: variant.isActive,
    });
  });

  branchVariants.forEach((variant) => {
    if (!rows.find((row) => row.sku === variant.sku)) {
      rows.push({
        sku: variant.sku,
        attributes: variant.attributes,
        quantity: variant.quantity,
        priceModifier: variant.priceModifier,
        costPrice: variant.costPrice,
        barcode: variant.barcode,
      });
    }
  });

  return rows;
};

export function InventoryDetailSheet({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: InventoryDetail | null;
}) {
  const image = product?.images?.[0]?.variants?.thumbnail || product?.images?.[0]?.url;
  const productType = product?.productType || (product?.variants?.length ? "variant" : "simple");
  const branchStock = product?.branchStock;
  const totalQuantity = branchStock?.quantity ?? product?.quantity ?? 0;
  const hasVariants = (product?.variants?.length || 0) > 0;
  const branchVariants = branchStock?.variants ?? [];
  const variantRows = product ? buildVariantRows(product.variants, branchVariants) : [];
  const inStockValue = branchStock
    ? branchStock.inStock
      ? "Yes"
      : "No"
    : "-";
  const lowStockValue = branchStock
    ? branchStock.lowStock
      ? "Yes"
      : "No"
    : "-";

  return (
    <SheetWrapper
      open={open}
      onOpenChange={onOpenChange}
      title="Inventory Details"
      description="Branch-level product snapshot"
      size="lg"
    >
      {!product ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Select an item to view details.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative w-16 h-16 rounded-xl bg-muted overflow-hidden ring-1 ring-border/20 shrink-0">
              {image ? (
                <img src={image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold truncate">{product.name || "-"}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{product._id || product.id || "-"}</span>
                <Badge variant="outline" className="capitalize">
                  {productType}
                </Badge>
                {getStockBadge(totalQuantity, branchStock?.lowStock, branchStock?.inStock)}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailRow label="Slug" value={product.slug || "-"} monospace />
            <DetailRow label="Category" value={product.category || "-"} />
            <DetailRow label="SKU" value={product.sku || "-"} monospace />
            <DetailRow label="Barcode" value={product.barcode || "-"} monospace />
            <DetailRow label="Base Price" value={formatPriceMaybe(product.basePrice)} />
            <DetailRow label="Cost Price" value={formatPriceMaybe(product.costPrice)} />
            <DetailRow label="Total Quantity" value={formatMaybeNumber(product.quantity)} monospace />
            <DetailRow label="Branch Quantity" value={formatMaybeNumber(branchStock?.quantity)} monospace />
            <DetailRow label="In Stock" value={inStockValue} />
            <DetailRow label="Low Stock" value={lowStockValue} />
            <DetailRow label="Images" value={formatMaybeNumber(product.images?.length || 0)} />
            <DetailRow label="Created" value={formatDate(product.createdAt)} />
            <DetailRow label="Updated" value={formatDate(product.updatedAt)} />
          </div>

          {hasVariants || branchVariants.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Variants</h3>
                <Badge variant="outline">{variantRows.length} total</Badge>
              </div>
              <div className="grid gap-3">
                {variantRows.map((variant) => (
                  <div key={variant.sku} className="rounded-lg border border-border/60 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold font-mono truncate">{variant.sku}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatVariantAttributes(variant.attributes) || "No attributes"}
                        </p>
                      </div>
                      {typeof variant.isActive === "boolean" && (
                        <Badge variant={variant.isActive ? "secondary" : "outline"}>
                          {variant.isActive ? "Active" : "Inactive"}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium text-foreground">Qty:</span>{" "}
                        <span className="font-mono">{formatMaybeNumber(variant.quantity)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Price Mod:</span>{" "}
                        <span className="font-mono">{formatPriceMaybe(variant.priceModifier ?? null)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Cost:</span>{" "}
                        <span className="font-mono">{formatPriceMaybe(variant.costPrice ?? null)}</span>
                      </div>
                      {variant.barcode && (
                        <div className="sm:col-span-2 lg:col-span-3">
                          <span className="font-medium text-foreground">Barcode:</span>{" "}
                          <span className="font-mono">{variant.barcode}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No variants available.</div>
          )}
        </div>
      )}
    </SheetWrapper>
  );
}
