"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useProducts } from "@/hooks/query/useProducts";
import { Button } from "@/components/ui/button";
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
  const [isFocused, setIsFocused] = useState(false);
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
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle form submit
  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery("");
      setIsFocused(false);
      inputRef.current?.blur();
      onSearch?.();
    }
  }, [query, router, onSearch]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setIsFocused(false);
    onSearch?.();
  }, [onSearch]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setIsFocused(false);
      inputRef.current?.blur();
    }
  }, []);

  const clearQuery = useCallback(() => {
    setQuery("");
    inputRef.current?.focus();
  }, []);

  const showDropdown = isOpen && query.length >= 2;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            "flex items-center gap-2 h-10 pl-3 pr-1 rounded-md border bg-background transition-all duration-200",
            isFocused
              ? "border-primary ring-2 ring-primary/20 shadow-sm"
              : "border-input hover:border-muted-foreground/30"
          )}
        >
          {/* Search Icon */}
          <Search className="size-4 text-muted-foreground shrink-0" />

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              setIsOpen(true);
              setIsFocused(true);
            }}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />

          {/* Loading / Clear */}
          {isLoading ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground shrink-0" />
          ) : query ? (
            <button
              type="button"
              onClick={clearQuery}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          ) : null}

          {/* Search Button */}
          <Button
            type="submit"
            size="sm"
            disabled={!query.trim()}
            className="h-7 rounded px-3 text-xs font-medium"
          >
            Search
          </Button>
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-200">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : suggestions && suggestions.length > 0 ? (
            <>
              {/* Results header */}
              <div className="px-4 py-2.5 border-b border-border bg-muted/30">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Products
                </p>
              </div>

              {/* Results list */}
              <div className="max-h-[340px] overflow-y-auto">
                {suggestions.map((product: any) => (
                  <Link
                    key={product._id}
                    href={`/products/${product.slug}`}
                    onClick={handleSuggestionClick}
                    className="group flex items-center gap-4 px-4 py-3 hover:bg-accent/50 transition-colors border-b border-border/50 last:border-0"
                  >
                    {product.images?.[0] ? (
                      <div className="size-14 rounded-lg overflow-hidden bg-muted shrink-0 ring-1 ring-border">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="size-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Search className="size-5 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate group-hover:text-primary transition-colors">
                        {product.name}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        ৳{product.basePrice?.toLocaleString()}
                      </p>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>

              {/* View all link */}
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="w-full px-4 py-3.5 text-sm font-medium text-center bg-muted/30 hover:bg-muted/50 text-primary transition-colors flex items-center justify-center gap-2 group"
              >
                View all results for "{query}"
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </>
          ) : debouncedQuery.length >= 2 ? (
            <div className="px-6 py-10 text-center">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="size-5 text-muted-foreground" />
              </div>
              <p className="font-medium mb-1">No products found</p>
              <p className="text-sm text-muted-foreground mb-4">
                We couldn't find anything for "{query}"
              </p>
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                Search anyway
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
