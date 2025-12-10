"use client";

import { Star, Share2, Truck, RefreshCw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ProductInfoProps {
  name: string;
  parentCategory: string;
  category: string;
  shortDescription?: string;
  averageRating?: number;
  reviewCount?: number;
  finalPrice: number;
  originalPrice?: number;
  hasDiscount: boolean;
}

export function ProductInfo({
  name,
  parentCategory,
  category,
  shortDescription,
  averageRating,
  reviewCount,
  finalPrice,
  originalPrice,
  hasDiscount,
}: ProductInfoProps) {
  return (
    <div className="space-y-6">
      {/* Category */}
      <p className="text-sm text-muted-foreground uppercase tracking-wider">
        {parentCategory ? `${parentCategory} / ${category}` : category}
      </p>

      {/* Title & Rating */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl mb-3">
          {name}
        </h1>

        {averageRating !== undefined && averageRating > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < Math.floor(averageRating)
                      ? "fill-foreground text-foreground"
                      : "fill-muted text-muted"
                  )}
                />
              ))}
            </div>
            <span className="text-sm">
              {averageRating.toFixed(1)} ({reviewCount} reviews)
            </span>
          </div>
        )}
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="font-display text-4xl">{formatPrice(finalPrice)}</span>
        {hasDiscount && originalPrice && (
          <span className="text-xl text-muted-foreground line-through">
            {formatPrice(originalPrice)}
          </span>
        )}
      </div>

      {/* Short Description */}
      {shortDescription && (
        <p className="text-muted-foreground text-lg leading-relaxed">
          {shortDescription}
        </p>
      )}
    </div>
  );
}

export function ProductFeatures() {
  const features = [
    { icon: Truck, title: "Free Shipping", description: "Orders over ৳5000" },
    { icon: RefreshCw, title: "Easy Returns", description: "7 days return" },
    { icon: Shield, title: "Secure Payment", description: "100% secure" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
      {features.map(({ icon: Icon, title, description }) => (
        <div key={title} className="text-center p-4">
          <Icon className="h-6 w-6 mx-auto mb-2" />
          <p className="text-xs font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      ))}
    </div>
  );
}

export function ShareButton() {
  const { toast } = useToast();

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Product link copied to clipboard",
      });
    }
  };

  return (
    <Button variant="outline" className="gap-2" onClick={handleShare}>
      <Share2 className="h-4 w-4" />
      Share Product
    </Button>
  );
}
