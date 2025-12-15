"use client";

import Link from "next/link";
import Image from "next/image";
import { cn, getImageUrl } from "@/lib/utils";
import { formatPrice, getDiscountPercentage } from "@/lib/constants";
import type { Product } from "@/types";

type CardVariant = "default" | "featured" | "compact" | "horizontal";

interface ProductCardProps {
  product: Product;
  variant?: CardVariant;
  className?: string;
  priority?: boolean;
}

export function ProductCard({
  product,
  variant = "default",
  className,
  priority = false,
}: ProductCardProps) {
  const featuredImage = product.featuredImage || product.images?.find((i) => i.isFeatured) || product.images?.[0];
  // Use thumbnail for horizontal (small), medium for other variants
  const imageSize = variant === "horizontal" ? "thumbnail" : "medium";
  const imageUrl = getImageUrl(featuredImage, imageSize) || "/placeholder.svg";
  const imageAlt = featuredImage?.alt || product.name;

  // Calculate discount - check for discount object or currentPrice virtual
  const currentPrice = product.currentPrice ?? product.basePrice;
  const hasDiscount = product.isDiscountActive || (product.discount && currentPrice < product.basePrice);
  const discountPercent = hasDiscount && product.basePrice > currentPrice
    ? getDiscountPercentage(product.basePrice, currentPrice)
    : 0;

  // Check if product is new (created within last 30 days)
  const isNew = product.createdAt 
    ? new Date(product.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    : false;

  // Check if best seller (using totalSales from stats)
  const isBestSeller = (product.stats?.totalSales ?? 0) > 50;

  if (variant === "horizontal") {
    return (
      <Link
        href={`/products/${product.slug}`}
        className={cn(
          "group flex gap-4 p-4 border border-border hover:border-foreground transition-colors rounded-lg",
          className
        )}
      >
        <div className="w-24 h-24 bg-muted overflow-hidden shrink-0 rounded-md relative">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="96px"
            priority={priority}
          />
        </div>
        <div className="flex flex-col justify-center min-w-0">
          <h3 className="font-medium text-sm truncate">{product.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-semibold">{formatPrice(currentPrice)}</span>
            {hasDiscount && (
              <span className="text-muted-foreground line-through text-sm">
                {formatPrice(product.basePrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/products/${product.slug}`}
        className={cn("group block", className)}
      >
        <div className="aspect-square bg-muted overflow-hidden mb-3 rounded-md relative">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
          />
        </div>
        <h3 className="text-sm font-medium truncate">{product.name}</h3>
        <p className="text-sm font-semibold mt-1">{formatPrice(currentPrice)}</p>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link
        href={`/products/${product.slug}`}
        className={cn("group block relative", className)}
      >
        <div className="aspect-[3/4] bg-muted overflow-hidden rounded-lg relative">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
        </div>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isNew && (
            <span className="bg-primary text-primary-foreground px-3 py-1 text-xs font-medium uppercase tracking-wider">
              New
            </span>
          )}
          {hasDiscount && discountPercent > 0 && (
            <span className="bg-destructive text-destructive-foreground px-3 py-1 text-xs font-medium">
              -{discountPercent}%
            </span>
          )}
        </div>

        <div className="mt-4">
          <h3 className="font-medium text-lg">{product.name}</h3>
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="font-semibold text-lg">{formatPrice(currentPrice)}</span>
            {hasDiscount && (
              <span className="text-muted-foreground line-through">
                {formatPrice(product.basePrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn("group block", className)}
    >
      <div className="relative aspect-[3/4] bg-muted overflow-hidden rounded-lg">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
        />
        
        {/* Quick view overlay */}
        <div className="absolute inset-0 flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="bg-background text-foreground px-6 py-2 text-sm font-medium uppercase tracking-wider rounded-md">
            View Product
          </span>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <span className="bg-primary text-primary-foreground px-2 py-1 text-xs font-medium uppercase tracking-wider">
              New
            </span>
          )}
          {hasDiscount && discountPercent > 0 && (
            <span className="bg-destructive text-destructive-foreground px-2 py-1 text-xs font-medium">
              -{discountPercent}%
            </span>
          )}
          {isBestSeller && !isNew && (
            <span className="bg-muted text-foreground px-2 py-1 text-xs font-medium uppercase tracking-wider">
              Best Seller
            </span>
          )}
        </div>
      </div>

      <div className="mt-3">
        <h3 className="font-medium truncate group-hover:underline">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-semibold">{formatPrice(currentPrice)}</span>
          {hasDiscount && (
            <span className="text-muted-foreground line-through text-sm">
              {formatPrice(product.basePrice)}
            </span>
          )}
        </div>
        {/* Rating */}
        {product.averageRating && product.averageRating > 0 && (
          <div className="flex items-center gap-1 mt-1.5 text-sm text-muted-foreground">
            <span className="text-yellow-500">★</span>
            <span>{product.averageRating.toFixed(1)}</span>
            {product.numReviews && <span>({product.numReviews})</span>}
          </div>
        )}
        {/* Color options preview */}
        {product.variations?.find((v) => v.name.toLowerCase() === "color") && (
          <div className="flex gap-1 mt-2">
            {product.variations
              .find((v) => v.name.toLowerCase() === "color")
              ?.options.slice(0, 4)
              .map((color) => (
                <span
                  key={color.value}
                  className="w-4 h-4 rounded-full border border-border"
                  style={{
                    backgroundColor: getColorHex(color.value),
                  }}
                  title={color.value}
                />
              ))}
          </div>
        )}
      </div>
    </Link>
  );
}

// Helper function to get color hex values
function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    black: "#000000",
    white: "#FFFFFF",
    gray: "#6B7280",
    grey: "#6B7280",
    navy: "#1E3A5F",
    olive: "#4B5320",
    red: "#EF4444",
    blue: "#3B82F6",
    green: "#22C55E",
    yellow: "#EAB308",
    orange: "#F97316",
    purple: "#A855F7",
    pink: "#EC4899",
    brown: "#92400E",
    beige: "#D4B896",
    cream: "#FFFDD0",
  };

  return colorMap[colorName.toLowerCase()] || "#9CA3AF";
}
