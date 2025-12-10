"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { ProductGrid } from "@/components/platform/product/ProductGrid";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductRecommendations } from "@/hooks/query/useProducts";
import type { Product } from "@/types";

interface RecommendedProductsProps {
  productId: string;
  currentCategory?: string;
  /** Pre-fetched recommendations from server */
  initialData?: Product[];
}

export function RecommendedProducts({ 
  productId, 
  currentCategory,
  initialData,
}: RecommendedProductsProps) {
  // Use client-side hook if no initial data
  const { recommendations, isLoading } = useProductRecommendations(productId, {
    enabled: !initialData,
  });

  // Use initialData if provided, otherwise use client-fetched data
  const products = initialData ?? recommendations;

  if (isLoading && !initialData) {
    return (
      <Section padding="lg" background="muted">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </Container>
      </Section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <Section padding="lg" background="muted">
      <Container>
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl md:text-3xl">You May Also Like</h2>
          {currentCategory && (
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href={`/products?category=${currentCategory}`}>
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          )}
        </div>
        <ProductGrid products={products} columns={4} variant="compact" />
      </Container>
    </Section>
  );
}
