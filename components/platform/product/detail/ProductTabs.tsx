"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewCard } from "@/components/platform/product/ReviewCard";
import { MarkdownPreview } from "@/components/form/lite-editor/MarkdownPreview";
import { SizeTable } from "@/feature/size-guide";
import { SIZE_GUIDE } from "@/data/constants";
import type { Review } from "@/types";

type ProductProperties = Record<string, unknown>;

interface ProductTabsProps {
  description?: string;
  properties?: ProductProperties;
  reviews: Review[];
  averageRating?: number;
  reviewCount?: number;
  showSizeGuide?: boolean;
}

export function ProductTabs({
  description,
  properties,
  reviews,
  averageRating,
  reviewCount,
  showSizeGuide = true,
}: ProductTabsProps) {
  const hasProperties = properties && Object.keys(properties).length > 0;

  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0 gap-8">
        <TabsTrigger value="description" className={tabTriggerStyles}>
          Description
        </TabsTrigger>
        {hasProperties && (
          <TabsTrigger value="properties" className={tabTriggerStyles}>
            Properties
          </TabsTrigger>
        )}
        {showSizeGuide && (
          <TabsTrigger value="size-guide" className={tabTriggerStyles}>
            Size Guide
          </TabsTrigger>
        )}
        <TabsTrigger value="reviews" className={tabTriggerStyles}>
          Reviews ({reviewCount || 0})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="pt-8">
        <DescriptionTab description={description} />
      </TabsContent>

      {hasProperties && (
        <TabsContent value="properties" className="pt-8">
          <PropertiesTab properties={properties} />
        </TabsContent>
      )}

      {showSizeGuide && (
        <TabsContent value="size-guide" className="pt-8">
          <SizeGuideTab />
        </TabsContent>
      )}

      <TabsContent value="reviews" className="pt-8">
        <ReviewsTab
          reviews={reviews}
          averageRating={averageRating}
          reviewCount={reviewCount}
        />
      </TabsContent>
    </Tabs>
  );
}

const tabTriggerStyles =
  "rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent pb-4 px-0 font-medium";

function DescriptionTab({ description }: { description?: string }) {
  if (!description) {
    return (
      <div className="max-w-3xl">
        <p className="text-muted-foreground">No description available.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="text-muted-foreground leading-relaxed text-lg">
        <MarkdownPreview content={description} />
      </div>
    </div>
  );
}

function PropertiesTab({ properties }: { properties?: ProductProperties }) {
  if (!properties) {
    return (
      <div className="max-w-3xl">
        <p className="text-muted-foreground">No properties available.</p>
      </div>
    );
  }

  // Helper to format property key
  const formatKey = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Helper to render property value based on type
  const renderValue = (value: unknown) => {
    if (Array.isArray(value)) {
      return (
        <ul className="space-y-2 mt-2">
          {value.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-foreground mt-0.5 shrink-0" />
              <span className="text-muted-foreground">{String(item)}</span>
            </li>
          ))}
        </ul>
      );
    }

    if (typeof value === "string") {
      // Check if it looks like markdown (has # or ** or *)
      if (value.includes("#") || value.includes("**") || value.includes("*")) {
        return <MarkdownPreview content={value} className="text-muted-foreground" />;
      }
      return <p className="text-muted-foreground mt-2">{value}</p>;
    }

    if (typeof value === "object" && value !== null) {
      return <pre className="text-muted-foreground text-sm mt-2">{JSON.stringify(value, null, 2)}</pre>;
    }

    return <p className="text-muted-foreground mt-2">{String(value)}</p>;
  };

  return (
    <div className="max-w-3xl">
      <div className="space-y-6">
        {Object.entries(properties).map(([key, value]) => (
          <div key={key} className="pb-6 border-b border-border last:border-0">
            <h4 className="font-medium text-lg mb-2">{formatKey(key)}</h4>
            {renderValue(value)}
          </div>
        ))}
      </div>
    </div>
  );
}

function SizeGuideTab() {
  return (
    <div className="max-w-4xl">
      <SizeTable tables={[...SIZE_GUIDE.sizeTables]} variant="compact" />
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-3">{SIZE_GUIDE.tips.title}</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {SIZE_GUIDE.tips.items.map((tip, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-foreground">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ReviewsTab({
  reviews,
  averageRating,
  reviewCount,
}: {
  reviews: Review[];
  averageRating?: number;
  reviewCount?: number;
}) {
  return (
    <div className="max-w-4xl">
      {averageRating !== undefined && reviewCount !== undefined && reviewCount > 0 && (
        <ReviewSummary
          averageRating={averageRating}
          reviewCount={reviewCount}
        />
      )}

      <div className="border-t border-border mt-6">
        {reviews.length > 0 ? (
          reviews.map((review) => <ReviewCard key={review.id} review={review} />)
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No reviews yet. Be the first to review!
            </p>
            <Button variant="outline">Write a Review</Button>
          </div>
        )}
      </div>

      {reviews.length > 0 && (
        <div className="mt-8 text-center">
          <Button variant="outline" size="lg">
            Load More Reviews
          </Button>
        </div>
      )}
    </div>
  );
}

function ReviewSummary({
  averageRating,
  reviewCount,
}: {
  averageRating: number;
  reviewCount: number;
}) {
  return (
    <div className="flex items-center gap-4 pb-6">
      <div className="text-center">
        <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
        <div className="flex gap-0.5 mt-1">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={i < Math.floor(averageRating) ? "text-yellow-500" : "text-muted"}
            >
              ★
            </span>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
        </p>
      </div>
    </div>
  );
}
