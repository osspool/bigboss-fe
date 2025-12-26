"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useBranch } from "@/contexts/BranchContext";

const navItems = [
  { href: "/dashboard/inventory", label: "Stock" },
  { href: "/dashboard/inventory/transfers", label: "Transfers (Challan)" },
  { href: "/dashboard/inventory/requests", label: "Requests" },
  { href: "/dashboard/inventory/purchases", label: "Purchases" },
  { href: "/dashboard/inventory/movements", label: "Movements" },
];

export function InventoryNav() {
  const pathname = usePathname();
  const { selectedBranch } = useBranch();

  const items = navItems.filter((i) => {
    if (i.href.endsWith("/purchases")) {
      return selectedBranch?.role === "head_office";
    }
    return true;
  });

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard/inventory" && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm border transition-colors",
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-muted border-border"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
