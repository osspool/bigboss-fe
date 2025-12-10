"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/types";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  isNew?: boolean;
  discountPercent?: number;
}

export function ProductGallery({
  images,
  productName,
  isNew,
  discountPercent,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Handle case when no images
  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/5] bg-muted flex items-center justify-center rounded-lg">
        <span className="text-muted-foreground">No image available</span>
      </div>
    );
  }

  const currentImage = images[selectedIndex];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-[4/5] bg-muted overflow-hidden relative group rounded-lg">
        <Image
          src={currentImage.url}
          alt={currentImage.alt || productName}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        {/* Tags */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isNew && (
            <span className="bg-primary text-primary-foreground px-3 py-1 text-xs font-medium uppercase tracking-wider">
              New
            </span>
          )}
          {discountPercent && discountPercent > 0 && (
            <span className="bg-destructive text-destructive-foreground px-3 py-1 text-xs font-medium">
              -{discountPercent}%
            </span>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "w-20 h-24 bg-muted overflow-hidden border-2 transition-all duration-200 flex-shrink-0 rounded-md relative",
                selectedIndex === index
                  ? "border-foreground"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <Image
                src={img.url}
                alt={img.alt || `${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
