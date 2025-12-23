"use client";
import { useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { DataTable } from "@/components/custom/ui/data-table";
import { inventoryColumns } from "./inventory-columns";
import { InventorySearch } from "./InventorySearch";
import { StockAdjustmentDialog } from "./StockAdjustmentDialog";
import { InventoryDetailSheet } from "./inventory-detail-sheet";
import { Package, AlertTriangle, TrendingDown, Boxes } from "lucide-react";
import HeaderSection from "@/components/custom/dashboard/header-section";
import ErrorBoundaryWrapper from "@/components/custom/error/error-boundary-wrapper";
import { useInventory, useInventoryLookup, useStockActions } from "@/hooks/query/useInventory";
import { useBranch } from "@/contexts/BranchContext";
import { useInventorySearch } from "@/hooks/filter/use-inventory-search";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getStockAdjustmentCapability, normalizeRoles } from "@/lib/access-control";
import type { PosProduct } from "@/types/pos.types";

type SearchType = "lookup" | "name";
type StockStatus = "all" | "ok" | "low" | "out";

type AppliedFilters = {
  searchType: SearchType;
  searchValue: string;
  parentCategory: string;
  category: string;
  stockStatus: StockStatus;
};

type AdjustmentSubmit = {
  mode: "add" | "remove" | "set";
  quantity: number;
  variantSku?: string;
  reason?: string;
  notes?: string;
};

interface InventoryClientProps {
  token: string;
  userRoles?: unknown;
  branchRoles?: unknown;
  initialLimit?: number;
}

export function InventoryClient({
  token,
  userRoles = [],
  branchRoles = [],
  initialLimit = 50,
}: InventoryClientProps) {
  const searchParams = useSearchParams();
  const { selectedBranch, isLoading: branchLoading } = useBranch();
  const roles = useMemo(() => normalizeRoles(userRoles), [userRoles]);

  // URL params
  const limit = Number(searchParams.get("limit")) || initialLimit;

  const [applied, setApplied] = useState<AppliedFilters>({
    searchType: "lookup",
    searchValue: "",
    parentCategory: "all",
    category: "all",
    stockStatus: "all",
  });

  // Search and filter state via hook
  const searchHook = useInventorySearch({
    onFilterChange: setApplied,
  });

  // Stock adjustment dialog state
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PosProduct | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<PosProduct | null>(null);

  const branchId = selectedBranch?._id;

  // Build filters from search hook and URL params
  const filters = useMemo(
    () => ({
      search:
        applied.searchType === "name"
          ? applied.searchValue.trim() || undefined
          : undefined,
      parentCategory:
        applied.parentCategory !== "all"
          ? applied.parentCategory
          : undefined,
      category: applied.category !== "all" ? applied.category : undefined,
      inStockOnly: applied.stockStatus === "ok" ? true : undefined,
      lowStockOnly: applied.stockStatus === "low" ? true : undefined,
      limit,
      sort: "name",
    }),
    [
      applied.searchValue,
      applied.searchType,
      applied.parentCategory,
      applied.category,
      applied.stockStatus,
      limit,
    ]
  );

  const lookupCode =
    applied.searchType === "lookup"
      ? applied.searchValue.trim()
      : "";

  const {
    items: products,
    summary,
    isLoading,
    isFetching,
    refetch,
  } = useInventory(token, branchId, filters, { enabled: !!branchId });

  const {
    data: lookupResult,
    isFetching: isLookupFetching,
    refetch: refetchLookup,
  } = useInventoryLookup(token, lookupCode, branchId, {
    enabled: !!branchId && applied.searchType === "lookup",
  });

  const { adjust, isAdjusting } = useStockActions(token);

  // Filter out-of-stock locally if needed (API may not support this filter directly)
  const filteredProducts = useMemo(() => {
    if (applied.stockStatus === "out") {
      return products.filter((p) => p.branchStock?.quantity === 0 || !p.branchStock?.inStock);
    }
    return products;
  }, [products, applied.stockStatus]);

  const lookupProducts = useMemo<PosProduct[]>(() => {
    if (!lookupCode || lookupCode.length < 2) return [];
    if (!lookupResult?.success || !lookupResult?.data?.product) return [];

    const quantity = lookupResult.data.quantity ?? 0;
    const lowStock = quantity > 0 && quantity <= 10;
    const product = lookupResult.data.product as unknown as Partial<PosProduct>;

    return [
      {
        _id: product._id || "",
        name: product.name || "",
        slug: product.slug || "",
        category: product.category || "uncategorized",
        basePrice: product.basePrice || 0,
        productType: product.productType || "simple",
        isActive: product.isActive ?? true,
        createdAt: product.createdAt || new Date().toISOString(),
        updatedAt: product.updatedAt || new Date().toISOString(),
        sku: product.sku,
        barcode: product.barcode,
        images: product.images,
        variants: product.variants,
        costPrice: product.costPrice,
        quantity,
        branchStock: {
          quantity,
          inStock: quantity > 0,
          lowStock,
        },
      },
    ] as PosProduct[];
  }, [lookupCode, lookupResult]);

  const displayProducts = useMemo(() => {
    const isLookupActive = applied.searchType === "lookup" && lookupCode.length >= 2;
    const base = isLookupActive ? lookupProducts : filteredProducts;

    if (applied.stockStatus === "out") {
      return base.filter(
        (p) => p.branchStock?.quantity === 0 || !p.branchStock?.inStock
      );
    }
    return base;
  }, [applied.searchType, lookupCode, lookupProducts, filteredProducts, applied.stockStatus]);

  // Handlers
  const handleAdjustStock = useCallback((product: PosProduct) => {
    const currentStock = product?.branchStock?.quantity ?? product?.quantity ?? 0;
    const cap = getStockAdjustmentCapability(roles, branchRoles, selectedBranch, currentStock);
    if (cap.mode === "none") {
      toast.error(cap.reason);
      return;
    }
    setSelectedProduct(product);
    setAdjustDialogOpen(true);
  }, [roles, branchRoles, selectedBranch]);

  const handleViewDetails = useCallback((product: PosProduct) => {
    setDetailProduct(product);
    setDetailOpen(true);
  }, []);

  const handleAdjustmentSubmit = useCallback(async (data: AdjustmentSubmit) => {
    if (!selectedProduct || !branchId) return;

    await adjust({
      productId: selectedProduct._id,
      variantSku: data.variantSku || undefined,
      quantity: data.quantity,
      mode: data.mode,
      branchId,
      reason: data.reason || undefined,
      notes: data.notes || undefined,
    });

    setAdjustDialogOpen(false);
    setSelectedProduct(null);
  }, [selectedProduct, branchId, adjust]);

  const handleDetailChange = useCallback((open: boolean) => {
    setDetailOpen(open);
    if (!open) {
      setDetailProduct(null);
    }
  }, []);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setAdjustDialogOpen(open);
    if (!open) setSelectedProduct(null);
  }, []);

  const columns = useMemo(
    () => inventoryColumns({
      onSetStock: handleAdjustStock,
      onView: handleViewDetails,
      disabledReason: (() => {
        const cap = getStockAdjustmentCapability(roles, branchRoles, selectedBranch ?? null, 0);
        return cap.mode === "none" ? cap.reason : undefined;
      })(),
    }),
    [handleAdjustStock, handleViewDetails, roles, branchRoles, selectedBranch]
  );

  const handleRefresh = useCallback(() => {
    if (applied.searchType === "lookup" && lookupCode.length >= 2) {
      refetchLookup();
      return;
    }
    refetch();
  }, [applied.searchType, lookupCode, refetch, refetchLookup]);

  const isRefreshing =
    applied.searchType === "lookup" && lookupCode.length >= 2
      ? isLookupFetching
      : isFetching;

  const isTableLoading =
    applied.searchType === "lookup" && lookupCode.length >= 2
      ? isLookupFetching
      : isLoading;

  // Stats cards data
  const stats = [
    {
      label: "Total Items",
      value: summary.totalItems,
      icon: Package,
      color: "primary",
    },
    {
      label: "Total Quantity",
      value: summary.totalQuantity.toLocaleString(),
      icon: Boxes,
      color: "success",
    },
    {
      label: "Low Stock",
      value: summary.lowStockCount,
      icon: TrendingDown,
      color: "warning",
      onClick: () => searchHook.setStockStatus("low"),
    },
    {
      label: "Out of Stock",
      value: summary.outOfStockCount,
      icon: AlertTriangle,
      color: "destructive",
      onClick: () => searchHook.setStockStatus("out"),
    },
  ];

  if (branchLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  if (!selectedBranch) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center">
        <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold">No Branch Selected</h3>
        <p className="text-muted-foreground">
          Please select a branch to view inventory
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <HeaderSection
        icon={Package}
        title="Inventory"
        variant="compact"
        description={`Stock levels for ${selectedBranch.name}`}
        badge={
          <Badge variant="outline" className="ml-2">
            {selectedBranch.code}
          </Badge>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              stat.onClick && "hover:border-primary/50"
            )}
            onClick={stat.onClick}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-bold tracking-tight">
                    {isLoading ? "-" : stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    stat.color === "primary" && "bg-primary/10 text-primary",
                    stat.color === "warning" && "bg-warning/10 text-warning",
                    stat.color === "destructive" && "bg-destructive/10 text-destructive",
                    stat.color === "success" && "bg-success/10 text-success"
                  )}
                >
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <InventorySearch
        searchHook={searchHook}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Inventory Table */}
      <ErrorBoundaryWrapper>
        <DataTable
          columns={columns}
          data={displayProducts}
          isLoading={isTableLoading}
          className="h-[60dvh] rounded-lg"
        />
      </ErrorBoundaryWrapper>

      {/* Stock Adjustment Dialog */}
      <StockAdjustmentDialog
        open={adjustDialogOpen}
        onOpenChange={handleDialogOpenChange}
        product={selectedProduct}
        onSubmit={handleAdjustmentSubmit}
        isSubmitting={isAdjusting}
        capability={(() => {
          if (!selectedBranch || !selectedProduct) return { mode: "set_any" };
          const currentStock =
            selectedProduct?.branchStock?.quantity ?? selectedProduct?.quantity ?? 0;
          const cap = getStockAdjustmentCapability(roles, branchRoles, selectedBranch, currentStock);
          return cap.mode === "set_decrease_only"
            ? { mode: "set_decrease_only", max: cap.max, reason: cap.reason }
            : { mode: "set_any" };
        })()}
      />

      <InventoryDetailSheet
        open={detailOpen}
        onOpenChange={handleDetailChange}
        product={detailProduct}
      />
    </div>
  );
}
