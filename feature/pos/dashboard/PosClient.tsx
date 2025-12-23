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
  generateIdempotencyKey,
} from "@/hooks/query/usePos";
import type { PosProduct, PosReceiptResponse } from "@/types/pos.types";
import { toast } from "sonner";
import { VariantSelectorDialog } from "./components/VariantSelectorDialog";
import { CartPanel } from "./components/CartPanel";
import { ProductsPanel } from "./components/ProductsPanel";
import { ReceiptPanel } from "./components/ReceiptPanel";
import { CustomerQuickAddDialog } from "./components/CustomerQuickAddDialog";
import { CustomerLookupDialog } from "./components/CustomerLookupDialog";
import { paymentNeedsReference } from "./pos-payment";
import { usePosCart, usePosCustomer, usePosPayment } from "../hooks";
import { extractOrderId, isValidBDPhone } from "../utils";

// ============================================
// MAIN COMPONENT
// ============================================

interface PosClientProps {
  token: string;
}

export function PosClient({ token }: PosClientProps) {
  const { selectedBranch, isLoading: branchLoading } = useBranch();
  const branchId = selectedBranch?._id;

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Variant selector state
  const [variantSelectorOpen, setVariantSelectorOpen] = useState(false);
  const [selectedProductForVariant, setSelectedProductForVariant] = useState<PosProduct | null>(null);

  // Receipt state
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [lastCashReceived, setLastCashReceived] = useState<number | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Barcode input
  const [barcodeInput, setBarcodeInput] = useState("");

  // Custom hooks
  const cart = usePosCart();
  const customer = usePosCustomer(token);
  const payment = usePosPayment(token, cart.cartSummary.total);

  // Product filters
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
  } = usePosProducts(token, branchId, productFilters, { enabled: !!branchId });

  const lookupMutation = usePosLookupMutation(token);
  const isLookingUp = lookupMutation.isPending;

  const { createOrder, isCreatingOrder } = usePosOrders(token);

  const {
    data: receiptResponse,
    isLoading: receiptLoading,
    isError: receiptError,
    refetch: refetchReceipt,
  } = usePosReceipt(token, lastOrderId || "", { enabled: !!lastOrderId });

  const lastReceipt = (receiptResponse as PosReceiptResponse | undefined)?.data ?? null;

  // Category tree for filter
  const { data: categoryTreeResponse } = useCategoryTree(token);
  const categoryTree = categoryTreeResponse?.data || [];

  const categories = useMemo(
    () => categoryTree.map((cat) => ({ slug: cat.slug, label: cat.name })),
    [categoryTree]
  );

  // Hide receipt when cart has items
  useEffect(() => {
    if (cart.cart.length > 0 && showReceipt) {
      setShowReceipt(false);
    }
  }, [cart.cart.length, showReceipt]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleBarcodeSubmit = useCallback(
    async (e: React.FormEvent) => {
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
          productType: lookupProduct.productType ?? (lookupProduct.variants?.length ? "variant" : "simple"),
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
              ? [{ sku: variantSku, attributes: matchedVariant?.attributes, quantity: quantity ?? 0, priceModifier: matchedVariant?.priceModifier }]
              : undefined,
          },
        } as PosProduct);

      cart.addToCart(normalizedProduct, variantSku || undefined);
    },
    [barcodeInput, branchId, lookupMutation, products, cart]
  );

  const handleOpenVariantSelector = useCallback((product: PosProduct) => {
    setSelectedProductForVariant(product);
    setVariantSelectorOpen(true);
  }, []);

  const handleVariantSelected = useCallback(
    (variantSku: string) => {
      if (selectedProductForVariant) {
        cart.addToCart(selectedProductForVariant, variantSku);
      }
    },
    [selectedProductForVariant, cart]
  );

  const handleCheckout = useCallback(async () => {
    if (cart.cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (!branchId) {
      toast.error("No branch selected");
      return;
    }

    try {
      if (payment.paymentMethods.length === 0 && !payment.paymentMethodsLoading) {
        toast.error("No active payment methods configured");
        return;
      }

      if (paymentNeedsReference(payment.selectedPosMethod)) {
        if (!payment.paymentReference.trim()) {
          toast.error("Payment reference is required");
          return;
        }
      } else {
        if (!payment.cashReceived.trim()) {
          toast.error("Enter cash received");
          return;
        }
        if (payment.amountDue > 0) {
          toast.error("Insufficient cash received");
          return;
        }
      }

      const trimmedPhone = customer.customerPhone.trim();
      if (trimmedPhone && !isValidBDPhone(trimmedPhone)) {
        toast.error("Phone number must be 11 digits (01XXXXXXXXX)");
        return;
      }

      const orderData = {
        items: cart.cart.map((item) => ({
          productId: item.productId,
          variantSku: item.variantSku,
          quantity: item.quantity,
          price: item.unitPrice,
        })),
        branchId,
        deliveryMethod: "pickup" as const,
        customer: {
          name: customer.customerName.trim() || "Walk-in Customer",
          ...(trimmedPhone && { phone: trimmedPhone }),
          ...(customer.selectedCustomer?._id && { id: customer.selectedCustomer._id }),
        },
        payment: {
          method: payment.selectedPosMethod,
          amount: cart.cartSummary.total,
          ...(paymentNeedsReference(payment.selectedPosMethod) && {
            reference: payment.paymentReference.trim(),
          }),
        },
        ...(cart.cartSummary.discount > 0 && { discount: cart.cartSummary.discount }),
        idempotencyKey: generateIdempotencyKey(),
      };

      const response = await createOrder(orderData);
      const nextOrderId = extractOrderId(response);

      // Success - reset state
      cart.resetCart();
      payment.resetPayment();
      customer.resetCustomer();
      setLastOrderId(nextOrderId);
      setLastCashReceived(payment.selectedPosMethod === "cash" ? payment.cashReceivedNumber : null);
      setShowReceipt(true);
      toast.success("Order completed! Ready to print receipt.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create order";
      toast.error(message);
      console.error("Checkout failed:", error);
    }
  }, [cart, branchId, createOrder, payment, customer]);

  const handleNewSale = useCallback(() => {
    setLastOrderId(null);
    setLastCashReceived(null);
    setShowReceipt(false);
    payment.resetPayment();
    customer.resetCustomer();
  }, [payment, customer]);

  // ============================================
  // LOADING STATES
  // ============================================

  if (branchLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
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
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
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
                onProductAdd={cart.addToCart}
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
            badge: cart.cart.length > 0 ? cart.cart.length : undefined,
            content: (
              <>
                {showReceipt && cart.cart.length === 0 ? (
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
                    cart={cart.cart}
                    cartSummary={cart.cartSummary}
                    isCreatingOrder={isCreatingOrder}
                    onCheckout={handleCheckout}
                    onClearCart={cart.clearCart}
                    onRemoveItem={cart.removeItem}
                    onUpdateQuantity={cart.updateQuantity}
                    paymentMethods={payment.paymentMethods}
                    paymentMethodsLoading={payment.paymentMethodsLoading}
                    selectedPaymentKey={payment.selectedPaymentKey}
                    onSelectPaymentKey={payment.setSelectedPaymentKey}
                    selectedPosPaymentMethod={payment.selectedPosMethod}
                    paymentReference={payment.paymentReference}
                    onPaymentReferenceChange={payment.setPaymentReference}
                    cashReceived={payment.cashReceived}
                    onCashReceivedChange={payment.setCashReceived}
                    changeAmount={payment.changeAmount}
                    amountDue={payment.amountDue}
                    selectedCustomer={customer.selectedCustomer}
                    onClearCustomer={customer.clearCustomer}
                    onOpenCustomerLookup={() => customer.setLookupDialogOpen(true)}
                    customerName={customer.customerName}
                    onCustomerNameChange={customer.setCustomerName}
                    customerPhone={customer.customerPhone}
                    onCustomerPhoneChange={customer.setCustomerPhone}
                    discount={cart.discountInput}
                    onDiscountChange={cart.setDiscountInput}
                  />
                )}
                <CustomerQuickAddDialog
                  token={token}
                  open={customer.createDialogOpen}
                  onOpenChange={customer.setCreateDialogOpen}
                  defaultName={customer.customerName}
                  defaultPhone={
                    /^01\d{9}$/.test(customer.customerSearch.trim())
                      ? customer.customerSearch.trim()
                      : customer.customerPhone
                  }
                  onCreated={customer.handleCustomerCreated}
                />
                <CustomerLookupDialog
                  open={customer.lookupDialogOpen}
                  onOpenChange={customer.setLookupDialogOpen}
                  searchValue={customer.customerSearch}
                  onSearchValueChange={customer.setCustomerSearch}
                  onSearch={customer.triggerSearch}
                  results={customer.customerResults}
                  isLoading={customer.isSearching}
                  onSelect={customer.selectCustomer}
                  onCreate={() => {
                    customer.setLookupDialogOpen(false);
                    customer.setCreateDialogOpen(true);
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
