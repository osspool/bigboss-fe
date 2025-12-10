"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, ArrowLeft } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useProducts } from "@/hooks/query/useProducts";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface MobileSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSearchOverlay({ isOpen, onClose }: MobileSearchOverlayProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Fetch suggestions when typing
  const { items: suggestions, isLoading } = useProducts(
    null,
    {
      search: debouncedQuery,
      limit: 8,
      select: "name,slug,images,basePrice",
    },
    {
      public: true,
      enabled: isOpen && debouncedQuery.length >= 2,
    }
  );

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the overlay is visible
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle form submit
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  }, [query, router, onClose]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border">
        <button
          type="button"
          onClick={onClose}
          className="p-2 -ml-2 hover:bg-accent rounded-md transition-colors"
          aria-label="Close search"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <form onSubmit={handleSubmit} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="search"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-10 bg-muted/50 rounded-lg border-0 text-base focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {query.length < 2 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-center">
              Search for products by name, category, or style
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : suggestions && suggestions.length > 0 ? (
          <div className="divide-y divide-border">
            {suggestions.map((product: any) => (
              <Link
                key={product._id}
                href={`/products/${product.slug}`}
                onClick={handleSuggestionClick}
                className="flex items-center gap-4 px-4 py-4 hover:bg-accent transition-colors"
              >
                {product.images?.[0] && (
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ৳{product.basePrice?.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}

            {/* View all results button */}
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full px-4 py-4 text-center text-primary font-medium hover:bg-accent transition-colors"
            >
              View all results for &quot;{query}&quot;
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <p className="text-muted-foreground text-center mb-4">
              No products found for &quot;{query}&quot;
            </p>
            <button
              type="button"
              onClick={handleSubmit}
              className="text-primary font-medium hover:underline"
            >
              Search anyway
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
