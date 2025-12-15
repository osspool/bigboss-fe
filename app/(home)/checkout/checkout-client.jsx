"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ShoppingCart, Gift } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  OrderSummary,
  PaymentMethods,
} from "@/components/platform/checkout";
import { AddressSection } from "@/components/platform/checkout/AddressSection";
import { useCart } from "@/hooks/query/useCart";
import { useOrderActions } from "@/hooks/query/useOrders";
import { usePlatformConfig } from "@/hooks/query/usePlatformConfig";
import { useDeliveryCharge } from "@/hooks/query/useLogistics";
import { formatPrice } from "@/lib/constants";
import { getZoneName, getArea } from "@/lib/logistics-utils";
import { toast } from "sonner";
import { calculateCouponDiscount } from "@/lib/commerce-utils";
import CouponSection from "@/components/platform/checkout/coupon-section";

// ==================== Constants ====================

const FREE_SHIPPING_THRESHOLD = 5000;

// ==================== Component ====================

export default function CheckoutClient({ token, userId }) {
  const router = useRouter();

  // Data hooks
  const { items, subtotal, clearCart, getItemPrice, isLoading: isCartLoading } = useCart(token);
  const { config, isLoading: isConfigLoading } = usePlatformConfig(null);
  const { createOrder, isCreating } = useOrderActions(token);

  // Selected address state (includes areaId, zoneId, providerAreaIds for shipping)
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Order notes
  const [notes, setNotes] = useState("");

  // Payment state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");
  const [transactionId, setTransactionId] = useState("");
  const [senderPhone, setSenderPhone] = useState("");

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Gift order state
  const [isGift, setIsGift] = useState(false);
  const [giftRecipientName, setGiftRecipientName] = useState("");

  // ==================== Delivery Charge from API ====================

  // Determine COD amount (only charge COD fee for cash payments)
  const codAmount = selectedPaymentMethod === "cash" ? subtotal : 0;

  // Fetch delivery charge from logistics API
  const {
    deliveryCharge: apiDeliveryCharge,
    isLoading: isChargeLoading,
    isFetching: isChargeFetching,
  } = useDeliveryCharge({
    deliveryAreaId: selectedAddress?.areaId,
    amount: codAmount,
    enabled: !!selectedAddress?.areaId,
  });

  // ==================== Derived State ====================

  const paymentConfig = useMemo(() => {
    if (!config?.payment) {
      return {
        cash: { enabled: true },
      };
    }
    return config.payment;
  }, [config?.payment]);

  // Calculate shipping cost (apply free shipping threshold)
  const shippingCost = useMemo(() => {
    if (!selectedAddress?.areaId) return 0;
    const charge = apiDeliveryCharge || 0;
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : charge;
  }, [subtotal, apiDeliveryCharge, selectedAddress?.areaId]);

  const discount = useMemo(() => {
    return calculateCouponDiscount(appliedCoupon, subtotal);
  }, [appliedCoupon, subtotal]);

  const total = useMemo(() => {
    return subtotal + shippingCost - discount;
  }, [subtotal, shippingCost, discount]);

  const requiresTransactionDetails = useMemo(() => {
    return selectedPaymentMethod !== "cash" && paymentConfig[selectedPaymentMethod];
  }, [selectedPaymentMethod, paymentConfig]);

  // Derive zoneId from address or look it up from areaId
  // (handles older addresses that may not have zoneId saved)
  const resolvedZoneId = useMemo(() => {
    if (selectedAddress?.zoneId) return selectedAddress.zoneId;
    if (selectedAddress?.areaId) {
      const area = getArea(selectedAddress.areaId);
      return area?.zoneId || null;
    }
    return null;
  }, [selectedAddress?.zoneId, selectedAddress?.areaId]);

  // Zone name for display
  const zoneName = useMemo(() => {
    if (!resolvedZoneId) return null;
    return getZoneName(resolvedZoneId);
  }, [resolvedZoneId]);

  // ==================== Validation ====================

  const validateForm = useCallback(() => {
    const errors = [];

    // Validate selected address
    if (!selectedAddress) {
      errors.push("Please select or add a delivery address");
    } else if (!selectedAddress.areaId) {
      errors.push("Please edit your address to add a delivery area");
    } else if (!selectedAddress.recipientPhone) {
      errors.push("Please edit your address to add a phone number");
    } else if (!resolvedZoneId) {
      errors.push("Unable to determine delivery zone. Please re-select delivery area.");
    }

    // Validate gift recipient if gift order
    if (isGift && !giftRecipientName.trim() && !selectedAddress?.recipientName) {
      errors.push("Please enter a gift recipient name");
    }

    return errors;
  }, [selectedAddress, resolvedZoneId, isGift, giftRecipientName]);

  const validatePaymentData = useCallback(() => {
    if (!requiresTransactionDetails) return null;

    // For wallet payments (bkash, nagad, rocket), senderPhone is required
    const walletMethods = ["bkash", "nagad", "rocket"];
    if (walletMethods.includes(selectedPaymentMethod)) {
      if (!senderPhone || !/^01[0-9]{9}$/.test(senderPhone)) {
        return "Please enter a valid sender phone number (01XXXXXXXXX)";
      }
    }

    // Reference (TrxID) is optional - admin can verify later

    return null;
  }, [requiresTransactionDetails, selectedPaymentMethod, senderPhone]);

  // ==================== Handlers ====================

  const handleApplyCoupon = useCallback((coupon) => {
    setAppliedCoupon(coupon);
  }, []);

  const buildOrderPayload = useCallback(() => {
    // Build DeliveryAddress matching CHECKOUT_API_GUIDE format
    const deliveryAddress = {
      recipientName: isGift
        ? (giftRecipientName.trim() || selectedAddress.recipientName)
        : selectedAddress.recipientName,
      recipientPhone: selectedAddress.recipientPhone,
      addressLine1: selectedAddress.addressLine1,
      addressLine2: selectedAddress.addressLine2 || undefined,
      // Area info from saved address (from @classytic/bd-areas)
      areaId: selectedAddress.areaId,
      areaName: selectedAddress.areaName,
      zoneId: resolvedZoneId, // Use resolved zoneId (from address or derived from areaId)
      // Provider area IDs for logistics
      providerAreaIds: selectedAddress.providerAreaIds || undefined,
      // Location info
      city: selectedAddress.city,
      division: selectedAddress.division || undefined,
      postalCode: selectedAddress.postalCode || undefined,
      country: selectedAddress.country || "Bangladesh",
    };

    const basePayload = {
      deliveryAddress,
      delivery: {
        method: zoneName || "standard",
        price: shippingCost,
      },
      isGift: isGift || undefined,
      couponCode: appliedCoupon?.code || undefined,
      notes: notes || undefined,
    };

    // COD payment
    if (selectedPaymentMethod === "cash") {
      return {
        ...basePayload,
        paymentData: { type: "cash" }
      };
    }

    // Manual payment (bKash, Nagad, Rocket, Bank)
    const paymentData = {
      type: selectedPaymentMethod,
      reference: transactionId || undefined,
      senderPhone: selectedPaymentMethod !== "bank" ? senderPhone : undefined,
    };

    return { ...basePayload, paymentData };
  }, [
    selectedAddress,
    resolvedZoneId,
    zoneName,
    shippingCost,
    appliedCoupon,
    selectedPaymentMethod,
    transactionId,
    senderPhone,
    notes,
    isGift,
    giftRecipientName,
  ]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Validate form
      const formErrors = validateForm();
      if (formErrors.length > 0) {
        toast.error(formErrors[0]);
        return;
      }

      // Validate payment data
      const paymentError = validatePaymentData();
      if (paymentError) {
        toast.error(paymentError);
        return;
      }

      try {
        const payload = buildOrderPayload();
        const result = await createOrder(payload);

        // Navigate to success page
        if (result?.data?._id) {
          router.push(`/checkout/success?orderId=${result.data._id}`);
        } else {
          router.push("/profile/my-orders");
        }
      } catch (error) {
        console.error("Order creation failed:", error);
      }
    },
    [validateForm, validatePaymentData, buildOrderPayload, createOrder, router]
  );

  // ==================== Loading & Empty States ====================

  if (isCartLoading || isConfigLoading) {
    return null;
  }

  if (!items || items.length === 0) {
    return (
      <Container className="py-16">
        <div className="text-center max-w-md mx-auto">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="font-display text-2xl mb-2">Your Cart is Empty</h2>
          <p className="text-muted-foreground mb-6">
            Add some items to your cart to checkout.
          </p>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </Container>
    );
  }

  // ==================== Render ====================

  return (
    <Container className="py-8">
      <h1 className="font-display text-3xl md:text-4xl mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Address Selection */}
            <div className="bg-card border border-border p-6">
              <AddressSection
                token={token}
                selectedAddress={selectedAddress}
                onAddressChange={setSelectedAddress}
              />
            </div>

            {/* Gift Order Option */}
            <div className="bg-card border border-border p-6">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="isGift"
                  checked={isGift}
                  onCheckedChange={setIsGift}
                />
                <div className="space-y-1 flex-1">
                  <Label
                    htmlFor="isGift"
                    className="text-base font-medium cursor-pointer flex items-center gap-2"
                  >
                    <Gift className="h-5 w-5" />
                    This is a gift order
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Send this order as a gift to someone else. We'll include the recipient's name on the delivery.
                  </p>
                </div>
              </div>

              {/* Gift recipient name input */}
              {isGift && (
                <div className="mt-4 pl-6 space-y-2">
                  <Label htmlFor="giftRecipientName">
                    Gift Recipient Name
                    {!selectedAddress?.recipientName && <span className="text-destructive"> *</span>}
                  </Label>
                  <Input
                    id="giftRecipientName"
                    value={giftRecipientName}
                    onChange={(e) => setGiftRecipientName(e.target.value)}
                    placeholder={selectedAddress?.recipientName || "Enter recipient's full name"}
                  />
                  {selectedAddress?.recipientName && (
                    <p className="text-xs text-muted-foreground">
                      Leave blank to use "{selectedAddress.recipientName}" from saved address
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Order Notes */}
            <div className="bg-card border border-border p-6">
              <h3 className="font-medium text-lg mb-4">Order Notes (Optional)</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions for delivery..."
                className="w-full min-h-[100px] p-3 border rounded-md resize-none"
                rows={4}
              />
            </div>

            {/* Payment Methods */}
            <div className="bg-card border border-border p-6">
              <PaymentMethods
                config={paymentConfig}
                selected={selectedPaymentMethod}
                onChange={setSelectedPaymentMethod}
                transactionId={transactionId}
                onTransactionIdChange={setTransactionId}
                senderPhone={senderPhone}
                onSenderPhoneChange={setSenderPhone}
                total={total}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full h-14 text-base"
              disabled={isCreating || !selectedAddress?.areaId || isChargeLoading}
            >
              {isCreating ? (
                "Processing..."
              ) : isChargeLoading ? (
                "Calculating delivery..."
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Place Order — {formatPrice(total)}
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:sticky lg:top-24 space-y-6 self-start">
            <OrderSummary
              items={items}
              getItemPrice={getItemPrice}
              subtotal={subtotal}
              shippingCost={shippingCost}
              discount={discount}
              total={total}
              isShippingLoading={isChargeFetching && !!selectedAddress?.areaId}
            />

            <CouponSection
              token={token}
              subtotal={subtotal}
              onApplyCoupon={handleApplyCoupon}
              appliedCoupon={appliedCoupon}
            />
          </div>
        </div>
      </form>
    </Container>
  );
}
