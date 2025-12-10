import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import { productApi } from "@/api/platform/product-api";
import { ProductsUI } from "@/components/platform/product/ProductsUI";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Spinner } from "@/components/ui/spinner";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

export const metadata = {
  title: "Shop All Products | BigBoss",
  description: "Discover our complete collection of premium streetwear and fashion. Shop the latest styles, exclusive drops, and limited edition pieces.",
  openGraph: {
    title: "Shop All Products | BigBoss",
    description: "Discover our complete collection of premium streetwear and fashion.",
    type: "website",
  },
};

// Map frontend sort values to API sort params
const SORT_MAP = {
  newest: "-createdAt",
  "price-asc": "basePrice",
  "price-desc": "-basePrice",
  "best-selling": "-stats.totalSales",
  "top-rated": "-averageRating",
};

// Build API params from URL search params
function buildApiParams(searchParams) {
  const page = Number(searchParams?.page) || 1;
  const sort = SORT_MAP[searchParams?.sort] || "-createdAt";
  
  const params = {
    page,
    limit: DEFAULT_PAGE_SIZE,
    sort,
    // Lighter payload for list - exclude description and properties
    select: "-description,-properties",
  };

  // Add filters directly to params (API handles them via getAll)
  if (searchParams?.search) params.search = searchParams.search;
  if (searchParams?.category) params.category = searchParams.category;
  if (searchParams?.parentCategory) params.parentCategory = searchParams.parentCategory;
  if (searchParams?.minPrice) params["basePrice[gte]"] = searchParams.minPrice;
  if (searchParams?.maxPrice) params["basePrice[lte]"] = searchParams.maxPrice;
  if (searchParams?.sizes) params["tags[in]"] = searchParams.sizes;
  if (searchParams?.colors && !searchParams?.sizes) params["tags[in]"] = searchParams.colors;

  return params;
}

export default async function ProductsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const queryClient = getQueryClient();

  // Build params for prefetch
  const apiParams = buildApiParams(resolvedSearchParams);

  // Create query key matching what useProducts will use
  // useProducts uses KEYS.scopedList which includes scope and params
  const queryKey = ["products", "list", "super-admin", apiParams];

  // Prefetch products using productApi.getAll directly
  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => productApi.getAll({ params: apiParams }),
  });

  return (
    <Section padding="lg">
      <Container>
        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl mb-2">
            {resolvedSearchParams?.search 
              ? `Search: "${resolvedSearchParams.search}"`
              : resolvedSearchParams?.category 
                ? formatCategoryTitle(resolvedSearchParams.category)
                : "All Products"
            }
          </h1>
          <p className="text-muted-foreground">
            {resolvedSearchParams?.search 
              ? "Results matching your search"
              : "Explore our complete collection"
            }
          </p>
        </div>

        {/* Products with hydration */}
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[60vh]">
                <Spinner className="h-8 w-8" />
              </div>
            }
          >
            <ProductsUI
              initialPage={apiParams.page}
              initialSort={resolvedSearchParams?.sort || "newest"}
              initialSearch={resolvedSearchParams?.search || ""}
              initialCategory={resolvedSearchParams?.category}
              initialParentCategory={resolvedSearchParams?.parentCategory}
            />
          </Suspense>
        </HydrationBoundary>
      </Container>
    </Section>
  );
}

// Helper to format category title
function formatCategoryTitle(category) {
  return category
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
