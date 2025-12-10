"use client";

import Link from "next/link";
import { Package, Search, FilterX, ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";

interface ProductEmptyStateProps {
  variant?: "no-products" | "no-results" | "no-filtered" | "error";
  searchQuery?: string;
  onClearFilters?: () => void;
  className?: string;
}

export function ProductEmptyState({
  variant = "no-products",
  searchQuery,
  onClearFilters,
  className,
}: ProductEmptyStateProps) {
  const config = {
    "no-products": {
      icon: Package,
      title: "No Products Yet",
      description: "We're working on adding new products. Check back soon!",
      showBrowseAll: false,
      showClearFilters: false,
    },
    "no-results": {
      icon: Search,
      title: searchQuery ? `No results for "${searchQuery}"` : "No Products Found",
      description: "Try adjusting your search or browse our collections.",
      showBrowseAll: true,
      showClearFilters: false,
    },
    "no-filtered": {
      icon: FilterX,
      title: "No Matching Products",
      description: "No products match your current filters. Try adjusting or clearing them.",
      showBrowseAll: false,
      showClearFilters: true,
    },
    error: {
      icon: Package,
      title: "Something Went Wrong",
      description: "We couldn't load products. Please try again later.",
      showBrowseAll: true,
      showClearFilters: false,
    },
  };

  const { icon: Icon, title, description, showBrowseAll, showClearFilters } = config[variant];

  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon className="size-5" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        <div className="flex flex-col sm:flex-row gap-3">
          {showClearFilters && onClearFilters && (
            <Button variant="outline" onClick={onClearFilters} className="gap-2">
              <FilterX className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
          {showBrowseAll && (
            <Button asChild className="gap-2">
              <Link href="/products">
                <ShoppingBag className="h-4 w-4" />
                Browse All Products
              </Link>
            </Button>
          )}
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}

