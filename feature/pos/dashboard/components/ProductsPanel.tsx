"use client";

import { memo } from "react";
import { Barcode, Loader2, Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { PosProduct } from "@/types/pos.types";
import type { CategoryOption } from "../pos.types";
import { ProductCard } from "./ProductCard";

interface ProductsPanelProps {
  searchQuery: string;
  selectedCategory: string;
  categories: CategoryOption[];
  products: PosProduct[];
  productsLoading: boolean;
  barcodeInput: string;
  isLookingUp: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onCategoryChange: (value: string) => void;
  onBarcodeInputChange: (value: string) => void;
  onBarcodeSubmit: (e: React.FormEvent) => void | Promise<void>;
  onProductAdd: (product: PosProduct, variantSku?: string) => void;
  onOpenVariantSelector: (product: PosProduct) => void;
}

export const ProductsPanel = memo(function ProductsPanel({
  searchQuery,
  selectedCategory,
  categories,
  products,
  productsLoading,
  barcodeInput,
  isLookingUp,
  onSearchChange,
  onSearchSubmit,
  onCategoryChange,
  onBarcodeInputChange,
  onBarcodeSubmit,
  onProductAdd,
  onOpenVariantSelector,
}: ProductsPanelProps) {
  return (
    <div className="h-full flex flex-col p-6 overflow-hidden bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit();
          }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline" size="icon" className="shrink-0">
            <Search className="h-4 w-4" />
          </Button>
          {searchQuery.trim().length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0"
              onClick={() => onSearchChange("")}
            >
              Clear
            </Button>
          )}
        </form>

        <form onSubmit={onBarcodeSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Scan barcode..."
              value={barcodeInput}
              onChange={(e) => onBarcodeInputChange(e.target.value)}
              className="pl-9"
              disabled={isLookingUp}
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            size="icon"
            className="shrink-0"
            disabled={isLookingUp || barcodeInput.trim().length === 0}
            aria-label="Lookup barcode"
          >
            {isLookingUp ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Barcode className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange("all")}
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.slug}
            variant={selectedCategory === cat.slug ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(cat.slug)}
            className="capitalize"
          >
            {cat.label}
          </Button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-56" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Package className="h-12 w-12 text-muted-foreground/30 mb-2" />
            <p className="text-muted-foreground">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={onProductAdd}
                onOpenVariantSelector={onOpenVariantSelector}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
