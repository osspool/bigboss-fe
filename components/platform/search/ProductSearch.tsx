"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/constants";
import { useProducts } from "@/hooks/query";
import type { Product } from "@/types";

interface ProductSearchProps {
  className?: string;
  onClose?: () => void;
  variant?: "desktop" | "mobile";
}

const TRENDING_SEARCHES = ["Streetwear", "Oversized", "Black", "Premium"];
const RECENT_SEARCHES_KEY = "bigboss_recent_searches";

export function ProductSearch({ className, onClose, variant = "desktop" }: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch search results using useProducts with search param
  const { items: products, isLoading } = useProducts(
    null,
    { 
      search: debouncedQuery, 
      limit: 6,
      select: "name,slug,category,basePrice,images,currentPrice,isDiscountActive",
    },
    { 
      public: true,
      enabled: debouncedQuery.length >= 2,
    }
  );

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      }
    }
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Save recent search
  const saveRecentSearch = useCallback((searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed || typeof window === "undefined") return;
    
    const updated = [trimmed, ...recentSearches.filter((s) => s !== trimmed)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  }, [recentSearches]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query);
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      onClose?.();
    }
  };

  const handleQuickSearch = (searchTerm: string) => {
    saveRecentSearch(searchTerm);
    router.push(`/products?search=${encodeURIComponent(searchTerm)}`);
    setIsOpen(false);
    onClose?.();
  };

  const handleProductClick = () => {
    if (query.trim()) {
      saveRecentSearch(query);
    }
    setIsOpen(false);
    onClose?.();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    }
  };

  const showSuggestions = isOpen && (query.length < 2 || (products && products.length > 0) || isLoading);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className={cn(
            "pl-10 pr-10 bg-secondary/50 border-border/50 focus:bg-background transition-colors",
            variant === "mobile" ? "h-12 text-base" : "h-10"
          )}
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => {
              setQuery("");
              setDebouncedQuery("");
              inputRef.current?.focus();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </form>

      {/* Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-xl z-50 overflow-hidden max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : query.length >= 2 && products && products.length > 0 ? (
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Products
              </p>
              {products.map((product: Product) => (
                <Link
                  key={product._id || product.slug}
                  href={`/products/${product.slug}`}
                  onClick={handleProductClick}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-12 h-12 bg-secondary rounded overflow-hidden shrink-0 relative">
                    {product.images?.[0]?.url && (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {formatPrice(product.currentPrice ?? product.basePrice)}
                    </p>
                    {product.isDiscountActive && product.currentPrice && product.currentPrice < product.basePrice && (
                      <p className="text-xs text-muted-foreground line-through">
                        {formatPrice(product.basePrice)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
              <Button
                variant="ghost"
                className="w-full mt-2 text-sm"
                onClick={handleSubmit}
              >
                View all results for "{query}"
              </Button>
            </div>
          ) : query.length >= 2 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No products found for "{query}"</p>
              <Button
                variant="link"
                className="mt-2"
                onClick={() => {
                  router.push("/products");
                  setIsOpen(false);
                  onClose?.();
                }}
              >
                Browse all products
              </Button>
            </div>
          ) : (
            <div className="p-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Recent
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={clearRecentSearches}
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search) => (
                      <button
                        key={search}
                        onClick={() => handleQuickSearch(search)}
                        className="px-3 py-1.5 text-sm bg-secondary/50 hover:bg-secondary rounded-full transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Trending
                </p>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_SEARCHES.map((search) => (
                    <button
                      key={search}
                      onClick={() => handleQuickSearch(search)}
                      className="px-3 py-1.5 text-sm bg-secondary/50 hover:bg-secondary rounded-full transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Mobile Search Overlay
export function MobileSearchOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <ProductSearch variant="mobile" className="flex-1" onClose={onClose} />
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
