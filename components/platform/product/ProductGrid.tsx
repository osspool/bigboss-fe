"use client";

import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import { ProductCard } from "./ProductCard";

type GridColumns = 2 | 3 | 4;

interface ProductGridProps {
  products: Product[];
  columns?: GridColumns;
  className?: string;
  variant?: "default" | "featured" | "compact";
}

const columnClasses: Record<GridColumns, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
};

export function ProductGrid({
  products,
  columns = 4,
  className,
  variant = "default",
}: ProductGridProps) {
  return (
    <div className={cn("grid gap-4 md:gap-6", columnClasses[columns], className)}>
      {products.map((product, index) => (
        <ProductCard
          key={product._id || product.slug}
          product={product}
          variant={variant}
          priority={index < 4}
        />
      ))}
    </div>
  );
}
