"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import {
  ProductGallery,
  ProductInfo,
  ProductFeatures,
  ShareButton,
  VariationSelector,
  QuantitySelector,
  ProductTabs,
} from "@/components/platform/product/detail";
import { ProductGrid } from "@/components/platform/product/ProductGrid";
import { MarkdownPreview } from "@/components/form/lite-editor/MarkdownPreview";
import { useCart } from "@/hooks/query/useCart";
import { formatPrice, getDiscountPercentage } from "@/lib/constants";
import type { Product } from "@/types";

interface ProductDetailPageProps {
  product: Product;
  recommendations?: Product[];
  token?: string | null;
}

export function ProductDetailPage({ product, recommendations = [], token }: ProductDetailPageProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  // New variant system: selectedAttributes stores the selected attribute values (e.g., { size: "M", color: "Red" })
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [isOutOfStock, setIsOutOfStock] = useState(false);

  // Initialize cart hook
  const { addToCart, isUpdating } = useCart(token);

  // Check if product has variants
  // More robust check: look for actual variant data, not just productType
  // This handles cases where productType might be inconsistent with actual data
  const hasVariants = Boolean(
    product.variants &&
    product.variants.length > 0 &&
    product.variationAttributes &&
    product.variationAttributes.length > 0
  );

  // Initialize selected attributes with first values
  useEffect(() => {
    if (hasVariants && product.variationAttributes) {
      const initial: Record<string, string> = {};
      product.variationAttributes.forEach((attr) => {
        const attrKey = attr.name.toLowerCase();
        initial[attrKey] = attr.values[0];
      });
      setSelectedAttributes(initial);
    }
  }, [product._id, hasVariants, product.variationAttributes]);

  // Find the currently selected variant based on selectedAttributes
  const selectedVariant = useMemo(() => {
    if (!hasVariants || !product.variants) return null;

    return product.variants.find(variant => {
      if (!variant.isActive) return false;
      return Object.entries(selectedAttributes).every(([key, value]) =>
        variant.attributes[key] === value
      );
    });
  }, [hasVariants, product.variants, selectedAttributes]);

  // Check stock availability
  useEffect(() => {
    if (hasVariants) {
      // For variant products, check if selected variant exists and is active
      setIsOutOfStock(!selectedVariant || !selectedVariant.isActive);
    } else {
      // For simple products, check quantity
      setIsOutOfStock(product.quantity <= 0);
    }
  }, [hasVariants, selectedVariant, product.quantity]);

  // Calculate prices
  const currentPrice = product.currentPrice ?? product.basePrice;
  const hasDiscount = product.isDiscountActive || currentPrice < product.basePrice;
  const discountPercent = hasDiscount
    ? getDiscountPercentage(product.basePrice, currentPrice)
    : 0;

  // Calculate final price with variant modifier
  const finalPrice = useMemo(() => {
    if (hasVariants && selectedVariant) {
      return currentPrice + (selectedVariant.priceModifier || 0);
    }
    return currentPrice;
  }, [hasVariants, selectedVariant, currentPrice]);

  const handleAttributeChange = (attrKey: string, value: string) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attrKey]: value,
    }));
  };

  const handleAddToCart = () => {
    // Check if user is authenticated
    if (!token) {
      const currentUrl = encodeURIComponent(window.location.href);
      router.push(`/login?callbackUrl=${currentUrl}`);
      return;
    }

    // For variant products, ensure a variant is selected
    if (hasVariants) {
      if (!selectedVariant) {
        toast.error("Please select all product options before adding to cart.");
        return;
      }
    }

    // Check stock
    if (isOutOfStock) {
      toast.error("Selected product is out of stock.");
      return;
    }

    // Get product ID
    const productId = product._id;
    if (!productId) {
      toast.error("Invalid product ID");
      return;
    }

    // Add to cart with variantSku if variant product
    addToCart({
      productId,
      variantSku: hasVariants && selectedVariant ? selectedVariant.sku : undefined,
      quantity,
    });
  };

  return (
    <>
      <Section padding="sm">
        <Container>
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/products">Products</BreadcrumbLink>
              </BreadcrumbItem>
              {product.parentCategory && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/products?parentCategory=${product.parentCategory}`}>
                      {formatCategoryName(product.parentCategory)}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{product.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Main product section */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Gallery */}
            <ProductGallery
              images={product.images || []}
              productName={product.name}
              isNew={isNewProduct(product.createdAt)}
              discountPercent={discountPercent}
            />

            {/* Details */}
            <div className="lg:py-4">
              <div className="space-y-6">
                <ProductInfo
                  name={product.name}
                  parentCategory={formatCategoryName(product.parentCategory || "")}
                  category={formatCategoryName(product.category)}
                  shortDescription={product.shortDescription}
                  averageRating={product.averageRating}
                  reviewCount={product.numReviews}
                  finalPrice={finalPrice}
                  originalPrice={hasDiscount ? product.basePrice : undefined}
                  hasDiscount={hasDiscount}
                />

                {/* Variation Selector (new variant system) */}
                {hasVariants && product.variationAttributes && product.variants && (
                  <VariationSelector
                    variationAttributes={product.variationAttributes}
                    variants={product.variants}
                    selectedAttributes={selectedAttributes}
                    onAttributeChange={handleAttributeChange}
                  />
                )}

                {/* Quantity & Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <QuantitySelector
                    quantity={quantity}
                    onQuantityChange={setQuantity}
                    max={product.quantity}
                  />
                  <Button
                    size="lg"
                    className="flex-1 h-14 text-base"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || isUpdating}
                  >
                    {isUpdating
                      ? "Adding to Cart..."
                      : isOutOfStock
                      ? "Out of Stock"
                      : `Add to Cart — ${formatPrice(finalPrice * quantity)}`}
                  </Button>
                </div>

                {/* Stock indicator */}
                {product.quantity > 0 && product.quantity <= 10 && (
                  <p className="text-sm text-orange-600">
                    Only {product.quantity} left in stock
                  </p>
                )}

                <ShareButton />
                <ProductFeatures />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Product Details Tabs - Desktop */}
      <Section padding="lg" background="default" className="hidden lg:block">
        <Container>
          <ProductTabs
            description={product.description}
            properties={product.properties}
            reviews={[]}
            averageRating={product.averageRating}
            reviewCount={product.numReviews}
            sizeGuideId={product.sizeGuide}
          />
        </Container>
      </Section>

      {/* Mobile Accordion */}
      <Section padding="md" className="lg:hidden">
        <Container>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="description">
              <AccordionTrigger className="text-base font-medium">
                Description
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-muted-foreground leading-relaxed">
                  <MarkdownPreview
                    content={product.description || "No description available."}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {product.properties && Object.keys(product.properties).length > 0 && (
              <AccordionItem value="properties">
                <AccordionTrigger className="text-base font-medium">
                  Properties
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {Object.entries(product.properties).map(([key, value]) => (
                      <div key={key} className="border-b border-border last:border-0 pb-3">
                        <h5 className="font-medium mb-2 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </h5>
                        {Array.isArray(value) ? (
                          <ul className="space-y-1 text-muted-foreground">
                            {value.map((item, i) => (
                              <li key={i}>• {String(item)}</li>
                            ))}
                          </ul>
                        ) : typeof value === "string" ? (
                          <MarkdownPreview content={value} className="text-muted-foreground text-sm" />
                        ) : (
                          <p className="text-muted-foreground text-sm">{String(value)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            <AccordionItem value="shipping">
              <AccordionTrigger className="text-base font-medium">
                Shipping & Returns
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-muted-foreground">
                  <p>Free standard shipping on orders over ৳5,000.</p>
                  <p>Express delivery available (1-2 business days).</p>
                  <p>Easy returns within 7 days of delivery.</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Container>
      </Section>

      {/* Recommended Products */}
      {recommendations.length > 0 && (
        <Section padding="lg" background="muted">
          <Container>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl md:text-3xl">You May Also Like</h2>
              <Button variant="ghost" asChild>
                <Link href={`/products?category=${product.category}`}>
                  View All
                </Link>
              </Button>
            </div>
            <ProductGrid products={recommendations} columns={4} variant="compact" />
          </Container>
        </Section>
      )}
    </>
  );
}

// Helper functions
function formatCategoryName(category: string): string {
  if (!category) return "";
  return category
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function isNewProduct(createdAt?: string): boolean {
  if (!createdAt) return false;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return new Date(createdAt) > thirtyDaysAgo;
}
