"use client";

/**
 * PosClient - Main Point of Sale orchestrator component
 *
 * This component manages the entire POS workflow including:
 * - Product search and selection (barcode, search, browse)
 * - Cart management with discounts and membership benefits
 * - Customer lookup and membership card scanning
 * - Payment processing (single or split payments)
 * - Order checkout and receipt generation
 *
 * Layout: Fixed-height split panel (Products | Cart) with internal scrolling
 * State: Coordinated through custom hooks (usePosCart, usePosCustomer, usePosPayment)
 *
 * @see feature/pos/README.md for architecture details
 */

import { useDeferredValue, useMemo, useCallback, useEffect, useState } from "react";
import { Package, Loader2, ShoppingCart, AlertTriangle, RefreshCcw } from "lucide-react";
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
  generateIdempotencyKey,
} from "@/hooks/query/usePos";
import type { PosProduct, PosPaymentMethod, PosReceiptData } from "@/types/pos.types";
import { toast } from "sonner";
import { VariantSelectorDialog } from "./components/VariantSelectorDialog";
import { CartPanel } from "./components/CartPanel";
import { ProductsPanel } from "./components/ProductsPanel";
import { ReceiptPanel } from "./components/ReceiptPanel";
import { CustomerQuickAddDialog } from "./components/CustomerQuickAddDialog";
import { CustomerLookupDialog } from "./components/CustomerLookupDialog";
import { paymentNeedsReference } from "../hooks/usePosPayment";
import { usePosCart, usePosCustomer, usePosPayment } from "../hooks";
import { useManagerAuth } from "../hooks/useManagerAuth";
import { calculateOrderTotals, isValidBDPhone, parsePositiveNumber, transformOrderToReceipt } from "../utils";
import { ManagerAuthDialog } from "./components/ManagerAuthDialog";
import { useMembershipConfig } from "@/hooks/query/usePlatformConfig";
import { getReadableTextColor, getTierColor } from "@/lib/loyalty-utils";
import HeaderSection from "@/components/custom/dashboard/header-section";

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

  // Receipt state - store receipt data directly from order response (no extra API call)
  const [lastReceipt, setLastReceipt] = useState<PosReceiptData | null>(null);
  const [lastCashReceived, setLastCashReceived] = useState<number | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Barcode input
  const [barcodeInput, setBarcodeInput] = useState("");

  // Custom hooks
  const cart = usePosCart();
  const customer = usePosCustomer(token);
  const { membership } = useMembershipConfig(token);
  const discountAuth = useManagerAuth();

  // Discount auth dialog state
  const [discountAuthDialogOpen, setDiscountAuthDialogOpen] = useState(false);

  const orderTotals = useMemo(
    () =>
      calculateOrderTotals({
        items: cart.cart,
        manualDiscountInput: cart.discountInput,
        membershipConfig: membership,
        customer: customer.selectedCustomer,
        pointsToRedeemInput: cart.pointsToRedeemInput,
      }),
    [
      cart.cart,
      cart.discountInput,
      membership,
      customer.selectedCustomer,
      cart.pointsToRedeemInput,
    ]
  );

  const payment = usePosPayment(token, orderTotals.total);
  const cartMembershipCardId = cart.membershipCardId;
  const setCartMembershipCardId = cart.setMembershipCardId;

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

  useEffect(() => {
    if (customer.membershipCardId !== cartMembershipCardId) {
      setCartMembershipCardId(customer.membershipCardId);
    }
  }, [customer.membershipCardId, cartMembershipCardId, setCartMembershipCardId]);

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
      if (payment.options.length === 0 && !payment.isLoading) {
        toast.error("No active payment methods configured");
        return;
      }

      let paymentPayload: {
        payment?: { method: PosPaymentMethod; amount: number; reference?: string };
        payments?: { method: PosPaymentMethod; amount: number; reference?: string }[];
      } = {};

      if (payment.state.mode === "split") {
        // Validate all split entries
        if (!payment.validateAllSplits()) {
          toast.error("Please fix split payment errors");
          return;
        }

        if (payment.state.splitEntries.length === 0) {
          toast.error("Add at least one split payment");
          return;
        }

        const payments = payment.state.splitEntries.map((entry) => {
          const amount = parsePositiveNumber(entry.amount);
          return {
            method: entry.posMethod,
            amount,
            ...(entry.reference.trim() && { reference: entry.reference.trim() }),
          };
        });

        const splitTotal = payments.reduce((sum, p) => sum + p.amount, 0);
        if (Math.abs(splitTotal - orderTotals.total) > 0.01) {
          toast.error("Split payment total must match order total");
          return;
        }

        paymentPayload = { payments };
      } else {
        if (paymentNeedsReference(payment.state.selectedMethod)) {
          if (!payment.state.reference.trim()) {
            toast.error("Payment reference is required");
            return;
          }
        } else {
          if (!payment.state.cashReceived.trim()) {
            toast.error("Enter cash received");
            return;
          }
          if (payment.state.amountDue > 0) {
            toast.error("Insufficient cash received");
            return;
          }
        }

        paymentPayload = {
          payment: {
            method: payment.state.selectedMethod,
            amount: orderTotals.total,
            ...(paymentNeedsReference(payment.state.selectedMethod) && {
              reference: payment.state.reference.trim(),
            }),
          },
        };
      }

      const trimmedPhone = customer.customerPhone.trim();
      if (trimmedPhone && !isValidBDPhone(trimmedPhone)) {
        toast.error("Phone number must be 11 digits (01XXXXXXXXX)");
        return;
      }

      if (cart.pointsToRedeemInput.trim() && orderTotals.redemptionError) {
        toast.error(orderTotals.redemptionError);
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
        ...(cartMembershipCardId.trim() && {
          membershipCardId: cartMembershipCardId.trim(),
        }),
        customer: {
          name: customer.customerName.trim() || "Walk-in Customer",
          ...(trimmedPhone && { phone: trimmedPhone }),
          ...(customer.selectedCustomer?._id && { id: customer.selectedCustomer._id }),
        },
        ...paymentPayload,
        ...(cart.cartSummary.discount > 0 && { discount: cart.cartSummary.discount }),
        ...(orderTotals.pointsRedeemed > 0 && { pointsToRedeem: orderTotals.pointsRedeemed }),
        idempotencyKey: generateIdempotencyKey(),
      };

      const response = await createOrder(orderData);

      // Transform order response to receipt format (no extra API call needed)
      const branchInfo = {
        name: selectedBranch?.name || "Store",
        phone: selectedBranch?.phone,
      };
      const receipt = transformOrderToReceipt(response, branchInfo);

      // Success - reset state
      cart.resetCart();
      payment.reset();
      customer.resetCustomer();
      setLastReceipt(receipt);
      setLastCashReceived(
        payment.state.mode === "single" && payment.state.selectedMethod === "cash"
          ? parsePositiveNumber(payment.state.cashReceived)
          : null
      );
      setShowReceipt(true);
      toast.success("Order completed! Ready to print receipt.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create order";
      toast.error(message);
      console.error("Checkout failed:", error);
    }
  }, [cart, branchId, selectedBranch, createOrder, payment, customer, orderTotals]);

  const handleNewSale = useCallback(() => {
    setLastReceipt(null);
    setLastCashReceived(null);
    setShowReceipt(false);
    payment.reset();
    customer.resetCustomer();
  }, [payment, customer]);

  // ============================================
  // VIEW MODELS
  // ============================================

  const cartViewModel = useMemo(() => ({
    items: cart.cart,
    subtotal: orderTotals.subtotal,
    discount: orderTotals.manualDiscount,
    tierDiscount: orderTotals.tierDiscount,
    tierName: orderTotals.tierName,
    redemptionDiscount: orderTotals.redemptionDiscount,
    total: orderTotals.total,
    pointsToEarn: orderTotals.pointsToEarn,
  }), [cart.cart, orderTotals]);

  const customerViewModel = useMemo(() => {
    const tierName = customer.selectedCustomer?.membership?.tier || null;
    const tierColor = getTierColor(tierName);
    const tierTextColor = getReadableTextColor(tierColor);

    return {
      selected: customer.selectedCustomer,
      name: customer.customerName,
      phone: customer.customerPhone,
      membershipCardId: customer.membershipCardId,
      membershipStatus: customer.membershipLookupStatus,
      tierName,
      tierColor,
      tierTextColor,
    };
  }, [
    customer.selectedCustomer,
    customer.customerName,
    customer.customerPhone,
    customer.membershipCardId,
    customer.membershipLookupStatus,
  ]);

  const paymentViewModel = useMemo(() => ({
    options: payment.options,
    isLoading: payment.isLoading,
    state: payment.state,
    selectedOption: payment.selectedOption,
  }), [payment.options, payment.isLoading, payment.state, payment.selectedOption]);

  const discountAuthViewModel = useMemo(() => ({
    isAuthorized: discountAuth.isAuthorized,
    authorizedByName: discountAuth.authorizedBy?.name || null,
  }), [discountAuth.isAuthorized, discountAuth.authorizedBy]);

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
    <div className="flex flex-col gap-2 h-full">
      {/* Header */}
      <HeaderSection
        icon={Package}
        title="Point of Sale"
        variant="compact"
        actions={[
          {
            icon: RefreshCcw,
            text: "Refresh",
            loadingText: "Refreshing...",
            variant: "outline",
            size: "sm",
            onClick: () => refetch(),
            loading: isFetching,
          },
        ]}
      />

      <div className="flex-1 min-h-0">
        <ResponsiveSplitLayout
          className="h-full"
          persistLayoutKey="pos-split-layout"
          mobileVariant="tabs"
          desktopVariant="fixed"
          mobileBreakpoint="lg"
          rightPanelWidth={380}
          leftPanelClassName=""
          rightPanelClassName="bg-card border-l"
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
                    isLoading={false}
                    hasError={!lastReceipt}
                    onRetry={handleNewSale}
                    onNewSale={handleNewSale}
                    cashReceived={lastCashReceived}
                  />
                ) : (
                  <CartPanel
                    cart={cartViewModel}
                    customer={customerViewModel}
                    payment={paymentViewModel}
                    discountInput={cart.discountInput}
                    pointsToRedeemInput={cart.pointsToRedeemInput}
                    redemption={{
                      enabled: !!membership?.enabled
                        && !!membership?.redemption?.enabled
                        && !!customer.selectedCustomer?.membership?.cardId,
                      pointsBalance: customer.selectedCustomer?.membership?.points?.current ?? 0,
                      minRedeemPoints: membership?.redemption?.minRedeemPoints ?? 0,
                      maxRedeemPoints: Math.min(
                        orderTotals.maxAllowedPoints,
                        customer.selectedCustomer?.membership?.points?.current ?? 0
                      ),
                      pointsPerBdt: membership?.redemption?.pointsPerBdt ?? 1,
                      estimatedDiscount: orderTotals.redemptionDiscount,
                      error: orderTotals.redemptionError,
                    }}
                    discountAuth={discountAuthViewModel}
                    isCheckingOut={isCreatingOrder}
                    onUpdateQuantity={cart.updateQuantity}
                    onRemoveItem={cart.removeItem}
                    onClearCart={cart.clearCart}
                    onCustomerNameChange={customer.setCustomerName}
                    onCustomerPhoneChange={customer.setCustomerPhone}
                    onMembershipChange={(value) => {
                      customer.setMembershipCardId(value);
                      setCartMembershipCardId(value);
                    }}
                    onMembershipLookup={customer.triggerMembershipLookup}
                    onClearCustomer={customer.clearCustomer}
                    onOpenCustomerLookup={() => customer.setLookupDialogOpen(true)}
                    onDiscountChange={cart.setDiscountInput}
                    onRequestDiscountAuth={() => setDiscountAuthDialogOpen(true)}
                    onClearDiscountAuth={() => {
                      discountAuth.clearAuth();
                      cart.setDiscountInput("");
                    }}
                    onPointsToRedeemChange={cart.setPointsToRedeemInput}
                    onUseMaxPoints={() => {
                      if (orderTotals.maxAllowedPoints > 0) {
                        cart.setPointsToRedeemInput(String(orderTotals.maxAllowedPoints));
                      }
                    }}
                    onSelectPayment={payment.selectPayment}
                    onPaymentModeChange={payment.setMode}
                    onCashChange={payment.setCashReceived}
                    onReferenceChange={payment.setReference}
                    onSplitAdd={payment.addSplit}
                    onSplitUpdate={payment.updateSplit}
                    onSplitRemove={payment.removeSplit}
                    onCheckout={handleCheckout}
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
                <ManagerAuthDialog
                  open={discountAuthDialogOpen}
                  onOpenChange={(open) => {
                    setDiscountAuthDialogOpen(open);
                    if (!open) discountAuth.reset();
                  }}
                  onAuthorize={discountAuth.authorize}
                  isPending={discountAuth.isPending}
                  error={discountAuth.error}
                  title="Discount Authorization"
                  description="Enter manager or admin credentials to authorize discounts for this sale."
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
