"use client";

import { Loader2 } from "lucide-react";

/**
 * Loading skeleton shown while dashboard auth is being verified.
 * This allows the page shell to render immediately while auth check happens.
 */
export function DashboardSkeleton() {
  return (
    <div className="flex h-screen w-full">
      {/* Sidebar skeleton */}
      <div className="hidden md:flex w-64 flex-col border-r bg-muted/10">
        <div className="p-4">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex-1 p-4 space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-muted animate-pulse rounded" />
          ))}
        </div>
        <div className="p-4">
          <div className="h-12 bg-muted animate-pulse rounded" />
        </div>
      </div>
      
      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Verifying session...
        </p>
      </div>
    </div>
  );
}

