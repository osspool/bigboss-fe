"use client";

import { useDeferredValue, useMemo, useCallback, useEffect, useState } from "react";
import { Package, Loader2, ShoppingCart, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveSplitLayout } from "@/components/custom/ui/ResponsiveSplitLayout";
import { useBranch } from "@/contexts/BranchContext";
import { useCategoryTree } from "@/hooks/query/useCategories";
import {
  usePosProducts,
  usePosOrders,
  usePosLookupMutation,
  usePosReceipt,
  calculateVariantPrice,
  formatVariantLabel,
  getVariantStock,
  getPosProductImage,
  generateIdempotencyKey,
} from "@/hooks/query/usePos";
import type { PosProduct } from "@/types/pos.types";
import { toast } from "sonner";
import { VariantSelectorDialog } from "./components/VariantSelectorDialog";
import { usePaymentMethods } from "@/hooks/query/usePlatformConfig";
import { CartPanel } from "./components/CartPanel";
import { ProductsPanel } from "./components/ProductsPanel";
import { ReceiptPanel } from "./components/ReceiptPanel";
import { CustomerQuickAddDialog } from "./components/CustomerQuickAddDialog";
import { CustomerLookupDialog } from "./components/CustomerLookupDialog";
import type { PosCartItem, CategoryOption, PosPaymentMethod } from "./pos.types";
import { getPaymentKey, mapPlatformMethodToPosMethod, paymentNeedsReference } from "./pos-payment";
import type { PosReceiptResponse } from "@/types/pos.types";
import { useCustomers } from "@/hooks/query/useCustomers";
import type { Customer } from "@/types/customer.types";
import { buildFilterParams, buildSearchParams, getApiParams } from "@/lib/filter-utils";

const extractOrderId = (response: unknown): string | null => {
  if (!response || typeof response !== "object") return null;
  const record = response as Record<string, unknown>;
  const data = record.data && typeof record.data === "object" ? (record.data as Record<string, unknown>) : null;
  const candidate =
    data?.orderId ??
    data?._id ??
    data?.id ??
    record.orderId ??
    record._id ??
    record.id;
  return typeof candidate === "string" ? candidate : null;
};

const toCashReceivedNumber = (value: string) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const toPositiveNumber = (value: string) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return n > 0 ? n : 0;
};

// ============================================
// MAIN COMPONENT
// ============================================

interface PosClientProps {
  token: string;
}

export function PosClient({ token }: PosClientProps) {
  const { selectedBranch, isLoading: branchLoading } = useBranch();
  const branchId = selectedBranch?._id;

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [variantSelectorOpen, setVariantSelectorOpen] = useState(false);
  const [selectedProductForVariant, setSelectedProductForVariant] = useState<PosProduct | null>(null);
  const [selectedPaymentKey, setSelectedPaymentKey] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [cashReceived, setCashReceived] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerSearchApplied, setCustomerSearchApplied] = useState("");
  const [customerCreateOpen, setCustomerCreateOpen] = useState(false);
  const [customerLookupOpen, setCustomerLookupOpen] = useState(false);
  const [discountInput, setDiscountInput] = useState("");
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [lastCashReceived, setLastCashReceived] = useState<number | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const productFilters = useMemo(
    () => ({
      search: deferredSearchQuery.trim() || undefined,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      inStockOnly: true,
      limit: 50,
    }),
    [deferredSearchQuery, selectedCategory]
  );

  // Queries
  const {
    products,
    summary,
    isLoading: productsLoading,
    isFetching,
    refetch,
  } = usePosProducts(
    token,
    branchId,
    productFilters,
    { enabled: !!branchId }
  );

  // Barcode lookup (scan → act)
  const lookupMutation = usePosLookupMutation(token);
  const isLookingUp = lookupMutation.isPending;

  // Orders
  const { createOrder, isCreatingOrder } = usePosOrders(token);

  // Platform payment methods (per PLATFORM_API_GUIDE.md)
  const {
    paymentMethods: platformPaymentMethods,
    isLoading: paymentMethodsLoading,
  } = usePaymentMethods(token);

  const activePaymentMethods = useMemo(() => {
    const list = platformPaymentMethods || [];
    return list.filter((m) => m?.isActive !== false);
  }, [platformPaymentMethods]);

  const selectedPlatformPaymentMethod = useMemo(() => {
    if (activePaymentMethods.length === 0) return null;

    const keyed = activePaymentMethods.map((m, idx) => ({
      key: getPaymentKey(m, idx),
      method: m,
    }));

    return keyed.find((k) => k.key === selectedPaymentKey) || keyed[0];
  }, [activePaymentMethods, selectedPaymentKey]);

  // Keep `selectedPaymentKey` stable once methods load, so UI + checkout logic agree.
  useEffect(() => {
    if (selectedPaymentKey) return;
    if (activePaymentMethods.length === 0) return;

    const keyed = activePaymentMethods.map((m, idx) => ({
      key: getPaymentKey(m, idx),
      method: m,
    }));

    const cash = keyed.find((k) => k.method.type === "cash");
    setSelectedPaymentKey((cash || keyed[0])?.key ?? null);
  }, [activePaymentMethods, selectedPaymentKey]);

  const selectedPosPaymentMethod = useMemo((): PosPaymentMethod => {
    const platformMethod = selectedPlatformPaymentMethod?.method;
    const mapped = platformMethod ? mapPlatformMethodToPosMethod(platformMethod) : null;
    return mapped || "cash";
  }, [selectedPlatformPaymentMethod]);

  // Reset per-method inputs when switching method.
  useEffect(() => {
    setPaymentReference("");
    setCashReceived("");
  }, [selectedPosPaymentMethod]);

  // Cart calculations
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.lineTotal, 0), [cart]);
  const discountNumber = useMemo(() => {
    const raw = toPositiveNumber(discountInput);
    if (subtotal <= 0) return 0;
    return Math.min(raw, subtotal);
  }, [discountInput, subtotal]);
  const total = useMemo(
    () => Math.max(0, subtotal - discountNumber),
    [subtotal, discountNumber]
  );
  const cartSummary = useMemo(
    () => ({
      subtotal,
      discount: discountNumber,
      total,
      itemCount: cart.length,
    }),
    [subtotal, discountNumber, total, cart.length]
  );

  const cashReceivedNumber = useMemo(() => toCashReceivedNumber(cashReceived), [cashReceived]);

  const changeAmount = useMemo(() => {
    if (selectedPosPaymentMethod !== "cash") return 0;
    return Math.max(0, cashReceivedNumber - cartSummary.total);
  }, [cashReceivedNumber, cartSummary.total, selectedPosPaymentMethod]);

  const amountDue = useMemo(() => {
    if (selectedPosPaymentMethod !== "cash") return 0;
    return Math.max(0, cartSummary.total - cashReceivedNumber);
  }, [cashReceivedNumber, cartSummary.total, selectedPosPaymentMethod]);

  const normalizedCustomerSearch = customerSearchApplied.trim();
  const isExactPhoneSearch = /^01\d{9}$/.test(normalizedCustomerSearch);
  const isLikelyPhoneSearch = /^\d{4,}$/.test(normalizedCustomerSearch);
  const customerQueryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("limit", "5");

    if (!normalizedCustomerSearch) {
      return getApiParams(params);
    }

    if (isExactPhoneSearch) {
      const filterParams = buildFilterParams(
        { phone: normalizedCustomerSearch },
        { phone: { paramName: "phone", type: "string", defaultValue: "" } }
      );
      for (const [key, value] of filterParams) {
        params.set(key, value);
      }
    } else if (isLikelyPhoneSearch) {
      const phoneParams = buildFilterParams(
        { phone: normalizedCustomerSearch },
        { phone: { paramName: "phone[contains]", type: "string", defaultValue: "" } }
      );
      for (const [key, value] of phoneParams) {
        params.set(key, value);
      }
    } else {
      const nameParams = buildFilterParams(
        { name: normalizedCustomerSearch },
        { name: { paramName: "name[contains]", type: "string", defaultValue: "" } }
      );
      for (const [key, value] of nameParams) {
        params.set(key, value);
      }
    }

    return getApiParams(params);
  }, [isExactPhoneSearch, isLikelyPhoneSearch, normalizedCustomerSearch]);

  const {
    items: customerResultsRaw,
    isLoading: customersLoading,
    isFetching: customersFetching,
    refetch: refetchCustomers,
  } = useCustomers(token, customerQueryParams, {
    enabled: !!token && normalizedCustomerSearch.length >= 2,
    refetchOnWindowFocus: false,
  });

  const customerResults =
    normalizedCustomerSearch.length >= 2 ? ((customerResultsRaw || []) as Customer[]) : [];

  const {
    data: receiptResponse,
    isLoading: receiptLoading,
    isError: receiptError,
    refetch: refetchReceipt,
  } = usePosReceipt(token, lastOrderId || "", { enabled: !!lastOrderId });

  const lastReceipt = (receiptResponse as PosReceiptResponse | undefined)?.data ?? null;

  useEffect(() => {
    if (cart.length > 0 && showReceipt) {
      setShowReceipt(false);
    }
  }, [cart.length, showReceipt]);

  // Fetch category tree for dynamic POS category filter
  const { data: categoryTreeResponse } = useCategoryTree(token);
  const categoryTree = categoryTreeResponse?.data || [];

  // POS category filter: main parent categories only for quick filtering
  const categories = useMemo(
    () =>
      categoryTree.map((cat) => ({
        slug: cat.slug,
        label: cat.name,
      })),
    [categoryTree]
  );

  // ============================================
  // HANDLERS
  // ============================================

  const handleAddToCart = useCallback((product: PosProduct, variantSku?: string) => {
    const variant = variantSku
      ? product.variants?.find(v => v.sku === variantSku)
      : null;

    // Check stock
    if (variantSku) {
      const stock = getVariantStock(product, variantSku);
      if (stock <= 0) {
        toast.error("Out of stock");
        return;
      }
    } else if (!product.branchStock?.inStock) {
      toast.error("Out of stock");
      return;
    }

    const unitPrice = variant
      ? calculateVariantPrice(product.basePrice, variant.priceModifier)
      : product.basePrice;

    setCart((prev) => {
      const existingItemIndex = prev.findIndex(
        (item) => item.productId === product._id && item.variantSku === variantSku
      );

      if (existingItemIndex >= 0) {
        const next = [...prev];
        const existing = next[existingItemIndex];
        const quantity = existing.quantity + 1;
        next[existingItemIndex] = {
          ...existing,
          quantity,
          lineTotal: quantity * unitPrice,
        };
        return next;
      }

      const newItem: PosCartItem = {
        productId: product._id,
        productName: product.name,
        variantSku,
        variantLabel: variant?.attributes
          ? formatVariantLabel(variant.attributes)
          : undefined,
        quantity: 1,
        unitPrice,
        lineTotal: unitPrice,
        image: getPosProductImage(product),
      };
      return [...prev, newItem];
    });

    toast.success("Added to cart");
  }, []);

  const handleUpdateQuantity = useCallback((index: number, delta: number) => {
    setCart((prev) => {
      const next = [...prev];
      const item = next[index];
      if (!item) return prev;
      const quantity = Math.max(1, item.quantity + delta);
      next[index] = { ...item, quantity, lineTotal: quantity * item.unitPrice };
      return next;
    });
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearCart = useCallback(() => {
    if (window.confirm("Clear all items from cart?")) {
      setCart([]);
    }
  }, []);

  const handleBarcodeSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    if (!branchId) {
      toast.error("No branch selected");
      return;
    }

    setBarcodeInput("");

    const result = await lookupMutation.mutateAsync({ code, branchId });
    if (!result.success || !result.data?.product) {
      toast.error(result.message || "Product not found");
      return;
    }

    const { product: lookupProduct, variantSku, matchedVariant, quantity } = result.data;

    // Prefer the already-loaded product from /pos/products (has branchStock + full shape)
    const fullProduct = products.find((p) => p._id === lookupProduct._id);

    const normalizedProduct: PosProduct =
      fullProduct ??
      ({
        _id: lookupProduct._id,
        name: lookupProduct.name,
        slug: lookupProduct.slug,
        sku: lookupProduct.sku,
        barcode: lookupProduct.barcode,
        category: lookupProduct.category ?? "uncategorized",
        productType:
          lookupProduct.productType ??
          (lookupProduct.variants?.length ? "variant" : "simple"),
        basePrice: lookupProduct.basePrice,
        costPrice: lookupProduct.costPrice,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        quantity: quantity ?? 0,
        images: lookupProduct.images,
        variants: lookupProduct.variants,
        branchStock: {
          quantity: quantity ?? 0,
          inStock: (quantity ?? 0) > 0,
          lowStock: false,
          variants: variantSku
            ? [
                {
                  sku: variantSku,
                  attributes: matchedVariant?.attributes,
                  quantity: quantity ?? 0,
                  priceModifier: matchedVariant?.priceModifier,
                },
              ]
            : undefined,
        },
      } as PosProduct);

    handleAddToCart(normalizedProduct, variantSku || undefined);
  }, [barcodeInput, branchId, lookupMutation, products, handleAddToCart]);

  const handleOpenVariantSelector = useCallback((product: PosProduct) => {
    setSelectedProductForVariant(product);
    setVariantSelectorOpen(true);
  }, []);

  const handleVariantSelected = useCallback((variantSku: string) => {
    if (selectedProductForVariant) {
      handleAddToCart(selectedProductForVariant, variantSku);
    }
  }, [selectedProductForVariant, handleAddToCart]);

  const handleCheckout = useCallback(async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (!branchId) {
      toast.error("No branch selected");
      return;
    }

    try {
      if (activePaymentMethods.length === 0 && !paymentMethodsLoading) {
        toast.error("No active payment methods configured");
        return;
      }

      if (paymentNeedsReference(selectedPosPaymentMethod)) {
        const ref = paymentReference.trim();
        if (!ref) {
          toast.error("Payment reference is required");
          return;
        }
      } else {
        // Cash best practice: ensure full payment and show change
        if (!cashReceived.trim()) {
          toast.error("Enter cash received");
          return;
        }
        if (amountDue > 0) {
          toast.error("Insufficient cash received");
          return;
        }
      }

      const trimmedPhone = customerPhone.trim();
      if (trimmedPhone && !/^01\d{9}$/.test(trimmedPhone)) {
        toast.error("Phone number must be 11 digits (01XXXXXXXXX)");
        return;
      }

      const orderData = {
        items: cart.map(item => ({
          productId: item.productId,
          variantSku: item.variantSku,
          quantity: item.quantity,
          price: item.unitPrice,
        })),
        branchId,
        deliveryMethod: "pickup" as const,
        customer: {
          name: customerName.trim() || "Walk-in Customer",
          ...(trimmedPhone && { phone: trimmedPhone }),
          ...(selectedCustomer?._id && { id: selectedCustomer._id }),
        },
        payment: {
          method: selectedPosPaymentMethod,
          amount: cartSummary.total,
          ...(paymentNeedsReference(selectedPosPaymentMethod) && {
            reference: paymentReference.trim(),
          }),
        },
        ...(cartSummary.discount > 0 && { discount: cartSummary.discount }),
        idempotencyKey: generateIdempotencyKey(),
      };

      const response = await createOrder(orderData);
      const nextOrderId = extractOrderId(response);

      // Success - clear cart
      setCart([]);
      setPaymentReference("");
      setCashReceived("");
      setDiscountInput("");
      setCustomerName("");
      setCustomerPhone("");
      setSelectedCustomer(null);
      setCustomerSearch("");
      setCustomerSearchApplied("");
      setLastOrderId(nextOrderId);
      setLastCashReceived(selectedPosPaymentMethod === "cash" ? cashReceivedNumber : null);
      setShowReceipt(true);
      toast.success("Order completed! Ready to print receipt.");

      // Optionally show receipt
      console.log("Order created:", response);
    } catch (error) {
      console.error("Checkout failed:", error);
    }
  }, [
    cart,
    branchId,
    createOrder,
    cartSummary.total,
    cartSummary.discount,
    selectedPosPaymentMethod,
    paymentReference,
    cashReceived,
    amountDue,
    activePaymentMethods.length,
    paymentMethodsLoading,
    cashReceivedNumber,
    customerName,
    customerPhone,
    selectedCustomer,
  ]);

  const handleNewSale = useCallback(() => {
    setLastOrderId(null);
    setLastCashReceived(null);
    setShowReceipt(false);
    setPaymentReference("");
    setCashReceived("");
    setDiscountInput("");
    setCustomerName("");
    setCustomerPhone("");
    setSelectedCustomer(null);
    setCustomerSearch("");
    setCustomerSearchApplied("");
  }, []);

  const handleCustomerNameChange = useCallback((value: string) => {
    setCustomerName(value);
    if (selectedCustomer) setSelectedCustomer(null);
  }, [selectedCustomer]);

  const handleCustomerPhoneChange = useCallback((value: string) => {
    setCustomerPhone(value);
    if (selectedCustomer) setSelectedCustomer(null);
  }, [selectedCustomer]);

  const handleSelectCustomer = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerName(customer.name || "");
    setCustomerPhone(customer.phone || "");
    setCustomerSearch("");
    setCustomerSearchApplied("");
    setCustomerLookupOpen(false);
  }, []);

  const handleClearCustomer = useCallback(() => {
    setSelectedCustomer(null);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerSearch("");
    setCustomerSearchApplied("");
  }, []);

  const handleCustomerCreated = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerName(customer.name || "");
    setCustomerPhone(customer.phone || "");
    setCustomerSearch("");
    setCustomerSearchApplied("");
    setCustomerLookupOpen(false);
  }, []);

  const handleCustomerSearch = useCallback(() => {
    const trimmed = customerSearch.trim();
    if (trimmed.length < 2) {
      toast.error("Enter at least 2 characters to search");
      return;
    }
    setCustomerSearchApplied(trimmed);
    if (trimmed === customerSearchApplied) {
      refetchCustomers();
    }
  }, [customerSearch, customerSearchApplied, refetchCustomers]);

  // ============================================
  // LOADING STATES
  // ============================================

  if (branchLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!selectedBranch) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center">
        <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold">No Branch Selected</h3>
        <p className="text-muted-foreground">Please select a branch to use POS</p>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Point of Sale</h1>
            <p className="text-sm text-muted-foreground">
              {selectedBranch.name} ({selectedBranch.code})
            </p>
          </div>
          <div className="flex items-center gap-4">
            {summary.lowStockCount > 0 && (
              <Badge variant="secondary" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {summary.lowStockCount} Low Stock
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <ResponsiveSplitLayout
          className="h-full"
          persistLayoutKey="pos-split-layout"
          mobileVariant="tabs"
          desktopVariant="fixed"
          mobileBreakpoint="lg"
          rightPanelWidth={380}
          leftPanelClassName="overflow-hidden min-w-[600px]"
          rightPanelClassName="overflow-hidden bg-card border-l min-w-[340px] max-w-[420px]"
          leftPanel={{
            icon: <Package className="h-4 w-4" />,
            title: "Products",
            content: (
              <ProductsPanel
                barcodeInput={barcodeInput}
                categories={categories}
                isLookingUp={isLookingUp}
                onBarcodeInputChange={setBarcodeInput}
                onBarcodeSubmit={handleBarcodeSubmit}
                onCategoryChange={setSelectedCategory}
                onOpenVariantSelector={handleOpenVariantSelector}
                onProductAdd={handleAddToCart}
                products={products}
                productsLoading={productsLoading}
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                onSearchChange={setSearchQuery}
                onSearchSubmit={() => refetch()}
              />
            ),
          }}
          rightPanel={{
            icon: <ShoppingCart className="h-4 w-4" />,
            title: "Cart",
            badge: cart.length > 0 ? cart.length : undefined,
            content: (
              <>
                {showReceipt && cart.length === 0 ? (
                  <ReceiptPanel
                    receipt={lastReceipt}
                    isLoading={receiptLoading}
                    hasError={receiptError || !lastOrderId}
                    onRetry={lastOrderId ? refetchReceipt : () => {}}
                    onNewSale={handleNewSale}
                    cashReceived={lastCashReceived}
                  />
                ) : (
                  <CartPanel
                    cart={cart}
                    cartSummary={cartSummary}
                    isCreatingOrder={isCreatingOrder}
                    onCheckout={handleCheckout}
                    onClearCart={handleClearCart}
                    onRemoveItem={handleRemoveItem}
                    onUpdateQuantity={handleUpdateQuantity}
                    paymentMethods={activePaymentMethods}
                    paymentMethodsLoading={paymentMethodsLoading}
                    selectedPaymentKey={selectedPaymentKey}
                    onSelectPaymentKey={setSelectedPaymentKey}
                    selectedPosPaymentMethod={selectedPosPaymentMethod}
                    paymentReference={paymentReference}
                    onPaymentReferenceChange={setPaymentReference}
                    cashReceived={cashReceived}
                    onCashReceivedChange={setCashReceived}
                    changeAmount={changeAmount}
                    amountDue={amountDue}
                    selectedCustomer={selectedCustomer}
                    onClearCustomer={handleClearCustomer}
                    onOpenCustomerLookup={() => setCustomerLookupOpen(true)}
                    customerName={customerName}
                    onCustomerNameChange={handleCustomerNameChange}
                    customerPhone={customerPhone}
                    onCustomerPhoneChange={handleCustomerPhoneChange}
                    discount={discountInput}
                    onDiscountChange={setDiscountInput}
                  />
                )}
                <CustomerQuickAddDialog
                  token={token}
                  open={customerCreateOpen}
                  onOpenChange={setCustomerCreateOpen}
                  defaultName={customerName}
                  defaultPhone={
                    /^01\d{9}$/.test(customerSearch.trim())
                      ? customerSearch.trim()
                      : customerPhone
                  }
                  onCreated={handleCustomerCreated}
                />
                <CustomerLookupDialog
                  open={customerLookupOpen}
                  onOpenChange={setCustomerLookupOpen}
                  searchValue={customerSearch}
                  onSearchValueChange={setCustomerSearch}
                  onSearch={handleCustomerSearch}
                  results={customerResults}
                  isLoading={customersLoading || customersFetching}
                  onSelect={handleSelectCustomer}
                  onCreate={() => {
                    setCustomerLookupOpen(false);
                    setCustomerCreateOpen(true);
                  }}
                />
              </>
            ),
          }}
        />
      </div>

      {/* Variant Selector Dialog */}
      <VariantSelectorDialog
        product={selectedProductForVariant}
        open={variantSelectorOpen}
        onOpenChange={setVariantSelectorOpen}
        onSelect={handleVariantSelected}
      />
    </div>
  );
}
