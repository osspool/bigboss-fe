"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Package, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useBranches } from "@/hooks/query";
import { posApi } from "@classytic/commerce-sdk/sales";
import type { Branch } from "@/types";

interface BranchStockResult {
  branchId: string;
  quantity: number | null;
  productName?: string;
  error?: boolean;
}

interface CrossBranchStockLookupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** SKU or barcode to lookup (NOT product _id) */
  code?: string;
  /** Optional variant SKU - takes precedence over code if provided */
  variantSku?: string;
  token: string;
}

interface BranchStock {
  branch: Branch;
  quantity: number | null;
  isLoading: boolean;
  error?: string;
}

function StockBadge({ quantity }: { quantity: number | null }) {
  if (quantity === null) return <span className="text-muted-foreground">-</span>;
  if (quantity === 0) {
    return <Badge variant="destructive" className="font-mono">0</Badge>;
  }
  if (quantity <= 10) {
    return <Badge className="bg-warning/20 text-warning border-warning/30 font-mono">{quantity}</Badge>;
  }
  return <Badge className="bg-success/20 text-success border-success/30 font-mono">{quantity}</Badge>;
}

export function CrossBranchStockLookup({
  open,
  onOpenChange,
  code,
  variantSku,
  token,
}: CrossBranchStockLookupProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Use variantSku if provided, otherwise use code (SKU/barcode)
  const lookupCode = variantSku || code;

  // Fetch all branches
  const { items: branches, isLoading: branchesLoading } = useBranches(token, {}, { enabled: open && !!token });

  // Filter branches by search
  const filteredBranches = useMemo((): Branch[] => {
    if (!branches) return [];
    if (!searchQuery.trim()) return branches;
    const query = searchQuery.toLowerCase();
    return branches.filter(
      (b: Branch) =>
        b.name?.toLowerCase().includes(query) ||
        b.code?.toLowerCase().includes(query)
    );
  }, [branches, searchQuery]);

  // Fetch stock for all branches in parallel
  const stockQueries = useQuery<BranchStockResult[]>({
    queryKey: ["cross-branch-stock", lookupCode, branches?.map((b: Branch) => b._id)],
    queryFn: async (): Promise<BranchStockResult[]> => {
      if (!lookupCode || !branches?.length) return [];

      const results = await Promise.allSettled(
        branches.map(async (branch: Branch) => {
          try {
            // POS lookup expects SKU or barcode
            const response = await posApi.lookup({ token, code: lookupCode, branchId: branch._id });

            // Get quantity from the response data
            const quantity = response?.data?.quantity ?? 0;

            return {
              branchId: branch._id,
              quantity,
              productName: response?.data?.product?.name,
            };
          } catch {
            return { branchId: branch._id, quantity: 0, error: true };
          }
        })
      );

      return results.map((result: PromiseSettledResult<BranchStockResult>, idx: number): BranchStockResult => {
        if (result.status === "fulfilled") {
          return result.value;
        }
        return { branchId: branches[idx]._id, quantity: null, error: true };
      });
    },
    enabled: open && !!lookupCode && !!branches?.length,
    staleTime: 30 * 1000,
  });

  // Build stock map
  const stockMap = useMemo(() => {
    const map: Record<string, { quantity: number | null; productName?: string }> = {};
    stockQueries.data?.forEach((item: BranchStockResult) => {
      map[item.branchId] = { quantity: item.quantity, productName: item.productName };
    });
    return map;
  }, [stockQueries.data]);

  // Get product name from first successful lookup
  const productName = useMemo(() => {
    return Object.values(stockMap).find((s) => s.productName)?.productName || "Product";
  }, [stockMap]);

  // Calculate totals
  const totals = useMemo(() => {
    const validStocks = Object.values(stockMap).filter((s) => s.quantity !== null);
    const total = validStocks.reduce((sum, s) => sum + (s.quantity || 0), 0);
    const withStock = validStocks.filter((s) => (s.quantity || 0) > 0).length;
    return { total, withStock, outOf: validStocks.length };
  }, [stockMap]);

  const isLoading = branchesLoading || stockQueries.isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Cross-Branch Stock
          </DialogTitle>
          <DialogDescription>
            {productName}
            {variantSku && <span className="font-mono text-xs ml-2">({variantSku})</span>}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="flex flex-wrap gap-4 text-sm p-3 rounded-lg bg-muted/50">
            <div>
              <span className="text-muted-foreground">Total Stock:</span>{" "}
              <span className="font-semibold font-mono">{totals.total}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Available at:</span>{" "}
              <span className="font-semibold">{totals.withStock}/{totals.outOf} branches</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search branches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Branch List */}
          <div className="max-h-[300px] overflow-y-auto space-y-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredBranches.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No branches found
              </div>
            ) : (
              filteredBranches.map((branch: Branch) => {
                const stock = stockMap[branch._id];
                const quantity = stock?.quantity ?? null;
                const isHeadOffice = branch.role === "head_office";

                return (
                  <div
                    key={branch._id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border border-border/60",
                      isHeadOffice && "bg-primary/5 border-primary/20"
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{branch.name}</span>
                        {branch.code && (
                          <span className="text-xs text-muted-foreground font-mono">
                            {branch.code}
                          </span>
                        )}
                      </div>
                      {isHeadOffice && (
                        <span className="text-xs text-primary">Head Office</span>
                      )}
                    </div>
                    <StockBadge quantity={quantity} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
