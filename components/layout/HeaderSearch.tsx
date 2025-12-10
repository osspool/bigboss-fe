"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useProducts } from "@/hooks/query/useProducts";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface HeaderSearchProps {
  className?: string;
  onSearch?: () => void;
}

export function HeaderSearch({ className, onSearch }: HeaderSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Fetch suggestions when typing
  const { items: suggestions, isLoading } = useProducts(
    null,
    {
      search: debouncedQuery,
      limit: 5,
      select: "name,slug,images,basePrice",
    },
    {
      public: true,
      enabled: debouncedQuery.length >= 2,
    }
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle form submit
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery("");
      onSearch?.();
    }
  }, [query, router, onSearch]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    onSearch?.();
  }, [onSearch]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  }, []);

  const showDropdown = isOpen && query.length >= 2;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder="Search products..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-10 h-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
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

      {/* Search Suggestions Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : suggestions && suggestions.length > 0 ? (
            <>
              <div className="max-h-[320px] overflow-y-auto">
                {suggestions.map((product: any) => (
                  <Link
                    key={product._id}
                    href={`/products/${product.slug}`}
                    onClick={handleSuggestionClick}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
                  >
                    {product.images?.[0] && (
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ৳{product.basePrice?.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="border-t border-border">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full px-4 py-3 text-sm text-center text-primary hover:bg-accent transition-colors"
                >
                  View all results for &quot;{query}&quot;
                </button>
              </div>
            </>
          ) : debouncedQuery.length >= 2 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">No products found</p>
              <button
                type="button"
                onClick={handleSubmit}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Search for &quot;{query}&quot;
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
