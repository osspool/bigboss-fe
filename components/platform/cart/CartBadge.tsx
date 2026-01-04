"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartCount } from "@/hooks/query";

interface CartBadgeProps {
  token?: string | null;
}

/**
 * Cart badge component for header - shows cart icon with item count
 * Uses React Query for caching so multiple instances share the same data
 */
export function CartBadge({ token }: CartBadgeProps) {
  const { count, isLoading } = useCartCount(token || "");

  return (
    <Button variant="ghost" size="icon" className="relative" asChild>
      <Link href="/cart">
        <ShoppingBag className="h-5 w-5" />
        {!isLoading && count > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Link>
    </Button>
  );
}
