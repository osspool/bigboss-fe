import { Suspense } from "react";
import Link from "next/link";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ChevronRight, Home } from "lucide-react";
import { getQueryClient } from "@/lib/get-query-client";
import { productApi } from "@/lib/sdk";
import { ProductsUI } from "@/components/platform/product/ProductsUI";
import { Section, Container } from "@classytic/clarity/layout";
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
  if (searchParams?.tags) params.tags = searchParams.tags.split(",");

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

  // Build breadcrumb items
  const breadcrumbs = buildBreadcrumbs(resolvedSearchParams);

  // Get page title and description
  const { title, description } = getPageHeader(resolvedSearchParams);

  return (
    <Section padding="md">
      <Container>
        {/* Page header */}
        <div className="mb-8">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Home className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only">Home</span>
                </Link>
              </li>
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.href} className="flex items-center gap-1.5">
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-foreground font-medium">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="hover:text-foreground transition-colors">
                      {crumb.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          {/* Title and description */}
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              {title}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {description}
            </p>
          </div>
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
              initialTags={resolvedSearchParams?.tags?.split(",").filter(Boolean) || []}
            />
          </Suspense>
        </HydrationBoundary>
      </Container>
    </Section>
  );
}

// Helper to format category/tag title
function formatTitle(slug) {
  return slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Build breadcrumb items based on current filters
function buildBreadcrumbs(searchParams) {
  const crumbs = [{ label: "Shop", href: "/products" }];

  if (searchParams?.search) {
    crumbs.push({ label: `"${searchParams.search}"`, href: "#" });
  } else if (searchParams?.parentCategory) {
    const parentLabel = formatTitle(searchParams.parentCategory);
    crumbs.push({
      label: parentLabel,
      href: `/products?parentCategory=${searchParams.parentCategory}`,
    });

    if (searchParams?.category) {
      crumbs.push({
        label: formatTitle(searchParams.category),
        href: `/products?parentCategory=${searchParams.parentCategory}&category=${searchParams.category}`,
      });
    }
  } else if (searchParams?.category) {
    crumbs.push({
      label: formatTitle(searchParams.category),
      href: `/products?category=${searchParams.category}`,
    });
  } else if (searchParams?.tags) {
    const tagLabel = formatTitle(searchParams.tags.split(",")[0]);
    crumbs.push({ label: tagLabel, href: "#" });
  }

  return crumbs;
}

// Get page header content based on filters
function getPageHeader(searchParams) {
  if (searchParams?.search) {
    return {
      title: `Search Results`,
      description: `Showing results for "${searchParams.search}"`,
    };
  }

  if (searchParams?.tags) {
    const tag = searchParams.tags.split(",")[0];
    const tagTitles = {
      "new-arrivals": { title: "New Arrivals", description: "Discover the latest additions to our collection" },
      "best-sellers": { title: "Best Sellers", description: "Our most popular products loved by customers" },
      "featured": { title: "Featured Products", description: "Hand-picked selections just for you" },
      "sale": { title: "Sale", description: "Great deals on selected items" },
    };
    return tagTitles[tag] || { title: formatTitle(tag), description: "Explore our collection" };
  }

  if (searchParams?.parentCategory) {
    const parent = formatTitle(searchParams.parentCategory);
    if (searchParams?.category) {
      return {
        title: formatTitle(searchParams.category),
        description: `Browse ${parent}'s ${formatTitle(searchParams.category).toLowerCase()} collection`,
      };
    }
    return {
      title: parent,
      description: `Explore our ${parent.toLowerCase()} collection`,
    };
  }

  if (searchParams?.category) {
    return {
      title: formatTitle(searchParams.category),
      description: `Browse our ${formatTitle(searchParams.category).toLowerCase()} collection`,
    };
  }

  return {
    title: "All Products",
    description: "Explore our complete collection",
  };
}
