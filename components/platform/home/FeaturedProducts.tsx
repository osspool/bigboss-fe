"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { ProductGrid } from "@/components/platform/product/ProductGrid";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/query/useProducts";

interface FeaturedProductsData {
  badge?: string;
  headline?: string;
  description?: string;
  cta?: { label: string; href: string };
}

interface FeaturedProductsProps {
  data?: FeaturedProductsData;
}

export function FeaturedProducts({ data }: FeaturedProductsProps) {
  // Fetch featured products using useProducts hook
  const { items: products = [], isLoading } = useProducts(null, {
    tags: "featured",
    sort: "-createdAt",
    limit: 8,
    select: "-description,-properties",
  });

  // Don't render section if no products and not loading
  if (!isLoading && products.length === 0) {
    return null;
  }

  const badge = data?.badge || "Curated Selection";
  const headline = data?.headline || "TRENDING NOW";
  const description = data?.description || "Our most-loved pieces, handpicked for you. From essentials to statement makers.";
  const cta = data?.cta || { label: "View All Products", href: "/products" };

  return (
    <Section padding="xl" background="muted">
      <Container>
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">
            {badge}
          </p>
          <h2 className="font-display text-4xl md:text-5xl mb-4">{headline}</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {description}
          </p>
        </div>

        <ProductGrid products={products} columns={4} />

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <Link href={cta.href}>
              {cta.label}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
