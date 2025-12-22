"use client";
import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Package,
  Edit2,
  AlertTriangle,
  TrendingDown,
  Check,
  Barcode,
  Eye,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/constants";
import type { PosProduct } from "@/types/pos.types";

const LOW_STOCK_THRESHOLD = 10;

// Product image and name cell
const ProductCell = React.memo(({ item }: { item: PosProduct }) => {
  const name = item.name || "-";
  const image = item.images?.[0]?.variants?.thumbnail || item.images?.[0]?.url;
  const variants = item.variants ?? [];
  const hasVariants = variants.length > 0;
  const variantCount = hasVariants ? variants.filter((v) => v.isActive).length : 0;
  const productType = hasVariants ? "variant" : "simple";

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10 rounded-lg bg-muted overflow-hidden ring-1 ring-border/20 shrink-0">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="font-medium truncate">{name}</p>
        {productType === "variant" && variantCount > 0 && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
            {variantCount} variant{variantCount !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>
    </div>
  );
});
ProductCell.displayName = "ProductCell";

// SKU/Barcode cell
const SkuCell = React.memo(({ item }: { item: PosProduct }) => {
  const sku = item.sku || "-";
  const barcode = item.barcode;

  return (
    <div className="space-y-1">
      <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{sku}</code>
      {barcode && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Barcode className="h-3 w-3" />
          <span>{barcode}</span>
        </div>
      )}
    </div>
  );
});
SkuCell.displayName = "SkuCell";

// Category cell
const CategoryCell = React.memo(({ item }: { item: PosProduct }) => {
  const category = item.category || "-";
  return (
    <Badge variant="outline" className="font-normal capitalize">
      {category.replace(/-/g, " ")}
    </Badge>
  );
});
CategoryCell.displayName = "CategoryCell";

// Product type cell
const TypeCell = React.memo(({ item }: { item: PosProduct }) => {
  const type = item.productType || (item.variants?.length ? "variant" : "simple");
  return (
    <Badge variant="secondary" className="capitalize">
      {type}
    </Badge>
  );
});
TypeCell.displayName = "TypeCell";

// Price cell
const PriceCell = React.memo(({ item }: { item: PosProduct }) => {
  const price = item.basePrice || 0;
  const costPrice = item.costPrice;

  return (
    <div className="text-right">
      <p className="font-mono font-medium">{formatPrice(price)}</p>
      {costPrice && (
        <p className="text-xs text-muted-foreground font-mono">
          Cost: {formatPrice(costPrice)}
        </p>
      )}
    </div>
  );
});
PriceCell.displayName = "PriceCell";

// Stock quantity cell with status badge
const StockCell = React.memo(({ item }: { item: PosProduct }) => {
  const stock = item.branchStock;
  const quantity = stock?.quantity ?? item.quantity ?? 0;
  const isLowStock = stock?.lowStock || quantity <= LOW_STOCK_THRESHOLD;
  const isOutOfStock = quantity === 0 || stock?.inStock === false;

  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={cn(
          "text-lg font-bold tabular-nums",
          isOutOfStock
            ? "text-destructive"
            : isLowStock
            ? "text-warning"
            : "text-foreground"
        )}
      >
        {quantity}
      </span>
    </div>
  );
});
StockCell.displayName = "StockCell";

// Stock status badge
const StatusCell = React.memo(({ item }: { item: PosProduct }) => {
  const stock = item.branchStock;
  const quantity = stock?.quantity ?? item.quantity ?? 0;
  const isLowStock = stock?.lowStock || quantity <= LOW_STOCK_THRESHOLD;
  const isOutOfStock = quantity === 0 || stock?.inStock === false;

  if (isOutOfStock) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="w-3 h-3" />
        Out
      </Badge>
    );
  }

  if (isLowStock) {
    return (
      <Badge variant="secondary" className="gap-1 bg-warning/20 text-warning border-warning/30">
        <TrendingDown className="w-3 h-3" />
        Low
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="gap-1 bg-success/20 text-success border-success/30">
      <Check className="w-3 h-3" />
      OK
    </Badge>
  );
});
StatusCell.displayName = "StatusCell";

// Quick action button - simplified to only set stock
const QuickActionsCell = React.memo(
  ({
    item,
    onSetStock,
    onView,
    disabledReason,
  }: {
    item: PosProduct;
    onSetStock?: (item: PosProduct) => void;
    onView?: (item: PosProduct) => void;
    disabledReason?: string;
  }) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {onView && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onView(item)}
          title="View details"
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 gap-1.5"
            onClick={() => onSetStock?.(item)}
            disabled={!!disabledReason}
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Set Stock</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{disabledReason || "Update stock quantity"}</TooltipContent>
      </Tooltip>
    </div>
  );
});
QuickActionsCell.displayName = "QuickActionsCell";

export function inventoryColumns({
  onSetStock,
  onView,
  disabledReason,
}: {
  onSetStock?: (item: PosProduct) => void;
  onView?: (item: PosProduct) => void;
  disabledReason?: string;
}): ColumnDef<PosProduct>[] {
  return [
  {
    id: "product",
    header: "Product",
    cell: ({ row }) => <ProductCell item={row.original} />,
    enableSorting: true,
  },
  {
    id: "sku",
    header: "SKU / Barcode",
    cell: ({ row }) => <SkuCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: "category",
    header: "Category",
    cell: ({ row }) => <CategoryCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: "type",
    header: "Type",
    cell: ({ row }) => <TypeCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: "price",
    header: () => <div className="text-right">Price</div>,
    cell: ({ row }) => <PriceCell item={row.original} />,
    enableSorting: true,
  },
  {
    id: "stock",
    header: () => <div className="text-center">Stock</div>,
    cell: ({ row }) => <StockCell item={row.original} />,
    enableSorting: true,
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => <StatusCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    enableSorting: false,
    cell: ({ row }) => (
      <QuickActionsCell
        item={row.original}
        onSetStock={onSetStock}
        onView={onView}
        disabledReason={disabledReason}
      />
    ),
  },
];
}
