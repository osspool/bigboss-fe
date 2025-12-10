"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "@/components/layout/Container";

export function CheckoutSkeleton() {
  return (
    <Container className="py-8">
      {/* Header */}
      <Skeleton className="h-10 w-48 mb-8" />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Form Skeleton */}
          <div className="bg-card border border-border p-6 space-y-6">
            <Skeleton className="h-6 w-40" />
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>

          {/* Delivery Options Skeleton */}
          <div className="bg-card border border-border p-6 space-y-4">
            <Skeleton className="h-6 w-36" />
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>

          {/* Payment Methods Skeleton */}
          <div className="bg-card border border-border p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>

          {/* Submit Button Skeleton */}
          <Skeleton className="h-14 w-full" />
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <div className="bg-muted p-6 sticky top-24 space-y-4">
            <Skeleton className="h-7 w-36" />
            
            {/* Items */}
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-16 h-20" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-20" />
            </div>

            {/* Totals */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="flex justify-between pt-3 border-t border-border">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
