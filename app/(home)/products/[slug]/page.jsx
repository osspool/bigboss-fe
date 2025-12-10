import { Suspense } from "react";
import { notFound } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { productApi } from "@/api/platform/product-api";
import { ProductDetailPage } from "./components/ProductDetailClient";
import { Spinner } from "@/components/ui/spinner";
import "@/components/form/lite-editor/markdown-preview.css";

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const response = await productApi.getBySlug({ slug });
    const product = response?.data;

    if (!product) {
      return {
        title: "Product Not Found | BigBoss",
      };
    }

    const currentPrice = product.currentPrice ?? product.basePrice;
    const description = product.description 
      ? product.description.slice(0, 160) 
      : `Shop ${product.name} at BigBoss. Premium quality ${product.category} from our exclusive collection.`;

    return {
      title: `${product.name} | BigBoss`,
      description,
      openGraph: {
        title: product.name,
        description,
        type: "website",
        images: product.images?.[0]?.url 
          ? [{ url: product.images[0].url, alt: product.name }]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description,
        images: product.images?.[0]?.url ? [product.images[0].url] : [],
      },
      other: {
        "product:price:amount": currentPrice,
        "product:price:currency": "BDT",
      },
    };
  } catch (error) {
    return {
      title: "Product Not Found | BigBoss",
    };
  }
}

// Generate static params for popular products (optional - for SSG)
// export async function generateStaticParams() {
//   try {
//     const response = await productApi.getBestSellers({ limit: 50 });
//     const products = response?.docs || [];
//     return products.map((product) => ({ slug: product.slug }));
//   } catch {
//     return [];
//   }
// }

export default async function ProductSlugPage({ params }) {
  const { slug } = await params;

  try {
    // Get auth session
    const session = await auth();

    // Fetch product by slug
    const response = await productApi.getBySlug({ slug });
    const product = response?.data;

    if (!product) {
      notFound();
    }

    // Fetch recommendations in parallel (fire and forget for faster initial load)
    const productId = product._id || product.id;
    let recommendations = [];

    try {
      const recsResponse = await productApi.getRecommendations({ productId });
      recommendations = recsResponse?.data || [];
    } catch {
      // Silently fail - recommendations are not critical
    }

    return (
      <div className="min-h-screen pt-4">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <Spinner className="h-8 w-8" />
            </div>
          }
        >
          <ProductDetailPage
            product={product}
            recommendations={recommendations}
            token={session?.accessToken}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Error fetching product:", error);
    notFound();
  }
}

