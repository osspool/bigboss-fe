"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useProducts } from "@/hooks/query";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
  InputGroupText,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
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
  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  }, [query, router, onClose]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const clearQuery = useCallback(() => {
    setQuery("");
    inputRef.current?.focus();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-background animate-in fade-in-0 duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border bg-background">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="-ml-2"
          aria-label="Close search"
        >
          <ArrowLeft className="size-5" />
        </Button>

        <form onSubmit={handleSubmit} className="flex-1">
          <InputGroup className="bg-muted/40">
            <InputGroupAddon align="inline-start">
              <InputGroupText>
                <Search className="size-4" />
              </InputGroupText>
            </InputGroupAddon>

            <InputGroupInput
              ref={inputRef}
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              className="text-base"
            />

            <InputGroupAddon align="inline-end">
              {isLoading ? (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              ) : query ? (
                <InputGroupButton
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  onClick={clearQuery}
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </InputGroupButton>
              ) : null}
            </InputGroupAddon>
          </InputGroup>
        </form>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {query.length < 2 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-6">
              <Search className="size-7 text-muted-foreground/50" />
            </div>
            <p className="text-lg font-medium mb-2">Search Products</p>
            <p className="text-muted-foreground text-center text-sm">
              Find products by name, category, or style
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : suggestions && suggestions.length > 0 ? (
          <div>
            {/* Results header */}
            <div className="px-4 py-3 border-b border-border bg-muted/20 sticky top-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Products
              </p>
            </div>

            {/* Results list */}
            <div className="divide-y divide-border">
              {suggestions.map((product: any) => (
                <Link
                  key={product._id}
                  href={`/products/${product.slug}`}
                  onClick={handleSuggestionClick}
                  className="group flex items-center gap-4 px-4 py-4 hover:bg-accent/50 active:bg-accent transition-colors"
                >
                  {product.images?.[0] ? (
                    <div className="size-16 rounded-lg overflow-hidden bg-muted shrink-0 ring-1 ring-border">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="size-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Search className="size-5 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      ৳{product.basePrice?.toLocaleString()}
                    </p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground/50" />
                </Link>
              ))}
            </div>

            {/* View all results button */}
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="w-full px-4 py-4 text-center font-medium text-primary bg-muted/20 hover:bg-muted/40 active:bg-muted/50 transition-colors flex items-center justify-center gap-2 border-t border-border"
            >
              View all results for "{query}"
              <ArrowRight className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-6">
              <Search className="size-7 text-muted-foreground/50" />
            </div>
            <p className="text-lg font-medium mb-2">No products found</p>
            <p className="text-muted-foreground text-center text-sm mb-6">
              We couldn't find anything for "{query}"
            </p>
            <Button
              variant="outline"
              onClick={() => handleSubmit()}
              className="gap-2"
            >
              Search anyway
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
