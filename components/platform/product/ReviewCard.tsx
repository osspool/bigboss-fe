"use client";

import Image from "next/image";
import { Star, CheckCircle } from "lucide-react";
import type { Review } from "@/types";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard = ({ review }: ReviewCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="py-6 border-b border-border last:border-0">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0 relative">
          {review.user.avatar ? (
            <Image
              src={review.user.avatar}
              alt={review.user.name}
              fill
              className="object-cover"
              sizes="40px"
            />
          ) : (
            <span className="text-sm font-medium">
              {review.user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{review.user.name}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < review.rating
                      ? "fill-foreground text-foreground"
                      : "fill-muted text-muted"
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {formatDate(review.createdAt)}
            </span>
          </div>

          {/* Comment */}
          <p className="mt-3 text-muted-foreground leading-relaxed">
            {review.comment}
          </p>

          {/* Images */}
          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mt-3">
              {review.images.map((img, idx) => (
                <div
                  key={idx}
                  className="w-16 h-16 rounded-md overflow-hidden relative bg-muted"
                >
                  <Image
                    src={img}
                    alt={`Review image ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Helpful */}
          {review.helpful !== undefined && review.helpful > 0 && (
            <p className="text-xs text-muted-foreground mt-3">
              {review.helpful} {review.helpful === 1 ? "person" : "people"} found this helpful
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

interface ReviewSummaryProps {
  averageRating: number;
  reviewCount: number;
  reviews?: Review[];
}

export const ReviewSummary = ({
  averageRating,
  reviewCount,
  reviews = [],
}: ReviewSummaryProps) => {
  // Calculate rating distribution
  const distribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((r) => r.rating === rating).length;
    const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
    return { rating, count, percentage };
  });

  return (
    <div className="flex flex-col md:flex-row gap-8 py-6">
      {/* Overall Rating */}
      <div className="text-center md:text-left">
        <div className="font-display text-6xl">{averageRating.toFixed(1)}</div>
        <div className="flex justify-center md:justify-start mt-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-5 w-5",
                i < Math.floor(averageRating)
                  ? "fill-foreground text-foreground"
                  : "fill-muted text-muted"
              )}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Based on {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
        </p>
      </div>

      {/* Rating Distribution */}
      {reviews.length > 0 && (
        <div className="flex-1 space-y-2">
          {distribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <span className="text-sm w-3">{rating}</span>
              <Star className="h-4 w-4 fill-foreground text-foreground" />
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-8">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
