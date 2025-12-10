"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ShoppingCart, Gift } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  OrderSummary,
  DeliveryOptions,
  PaymentMethods,
  DELIVERY_OPTIONS,
} from "@/components/platform/checkout";
import { AddressSection } from "@/components/platform/checkout/AddressSection";
import { useCart } from "@/hooks/query/useCart";
import { useOrderActions } from "@/hooks/query/useOrders";
import { usePlatformConfig } from "@/hooks/query/usePlatformConfig";
import { formatPrice } from "@/lib/constants";
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

  // Selected address state
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Order notes
  const [notes, setNotes] = useState("");

  // Delivery state - use platform config delivery options if available
  // Transform API delivery options to match DeliveryOption type
  const deliveryOptions = useMemo(() => {
    if (config?.deliveryOptions?.length > 0) {
      return config.deliveryOptions
        .filter((opt) => opt.isActive !== false)
        .map((opt) => ({
          id: opt._id,
          label: opt.name,
          price: opt.price,
          days: opt.estimatedDays
            ? `${opt.estimatedDays} ${opt.estimatedDays === 1 ? 'day' : 'days'}`
            : opt.region || 'Standard delivery',
        }));
    }
    return DELIVERY_OPTIONS;
  }, [config?.deliveryOptions]);

  const [delivery, setDelivery] = useState(null);

  // Payment state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");
  const [transactionId, setTransactionId] = useState("");
  const [senderPhone, setSenderPhone] = useState("");

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Gift order state
  const [isGift, setIsGift] = useState(false);

  // ==================== Derived State ====================

  const paymentConfig = useMemo(() => {
    if (!config?.payment) {
      // Default config while loading
      return {
        cash: { enabled: true },
      };
    }
    return config.payment;
  }, [config?.payment]);

  const shippingCost = useMemo(() => {
    if (!delivery) return 0;
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : delivery.price;
  }, [subtotal, delivery]);

  const discount = useMemo(() => {
    return calculateCouponDiscount(appliedCoupon, subtotal);
  }, [appliedCoupon, subtotal]);

  const total = useMemo(() => {
    return subtotal + shippingCost - discount;
  }, [subtotal, shippingCost, discount]);

  const requiresTransactionDetails = useMemo(() => {
    return selectedPaymentMethod !== "cash" && paymentConfig[selectedPaymentMethod];
  }, [selectedPaymentMethod, paymentConfig]);

  // ==================== Validation ====================

  const validateForm = useCallback(() => {
    const errors = [];

    // Validate selected address
    if (!selectedAddress) {
      errors.push("Please select or add a delivery address");
    }

    // Validate delivery method
    if (!delivery) {
      errors.push("Please select a delivery method");
    }

    return errors;
  }, [selectedAddress, delivery]);

  const validatePaymentData = useCallback(() => {
    if (!requiresTransactionDetails) return null;

    if (!transactionId || transactionId.length < 5) {
      return "Please enter a valid Transaction ID (at least 5 characters)";
    }

    if (selectedPaymentMethod !== "bank") {
      if (!senderPhone || !/^01[0-9]{9}$/.test(senderPhone)) {
        return "Please enter a valid sender phone number (01XXXXXXXXX)";
      }
    }

    return null;
  }, [requiresTransactionDetails, transactionId, selectedPaymentMethod, senderPhone]);

  // ==================== Handlers ====================

  const handleApplyCoupon = useCallback((coupon) => {
    setAppliedCoupon(coupon);
  }, []);

  const buildOrderPayload = useCallback(() => {
    const basePayload = {
      deliveryAddress: {
        label: selectedAddress.label || undefined,
        addressLine1: selectedAddress.addressLine1,
        addressLine2: selectedAddress.addressLine2 || undefined,
        city: selectedAddress.city,
        state: selectedAddress.state || undefined,
        postalCode: selectedAddress.postalCode || undefined,
        country: selectedAddress.country || undefined,
        phone: selectedAddress.phone,
        recipientName: selectedAddress.recipientName,
      },
      delivery: {
        method: delivery.label, // Use label (method name) not id
        price: delivery.price,
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
      paymentDetails:
        selectedPaymentMethod === "bank"
          ? {
              bankName: paymentConfig.bank?.bankName,
              accountNumber: paymentConfig.bank?.accountNumber,
            }
          : {
              walletNumber: senderPhone,
              walletType: "personal",
            },
    };

    return { ...basePayload, paymentData };
  }, [
    selectedAddress,
    delivery,
    appliedCoupon,
    selectedPaymentMethod,
    transactionId,
    senderPhone,
    paymentConfig,
    notes,
    isGift,
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
        // Error toast is handled by useOrderActions
      }
    },
    [validateForm, validatePaymentData, buildOrderPayload, createOrder, router]
  );

  // ==================== Loading & Empty States ====================

  if (isCartLoading || isConfigLoading) {
    return null; // Suspense boundary will show skeleton
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
                    Check this if you're ordering on behalf of someone else. The recipient name in the delivery address will be used for the gift recipient.
                  </p>
                </div>
              </div>
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

            {/* Delivery Options */}
            <div className="bg-card border border-border p-6">
              <DeliveryOptions
                options={deliveryOptions}
                selected={delivery}
                onChange={setDelivery}
                freeShippingThreshold={FREE_SHIPPING_THRESHOLD}
                subtotal={subtotal}
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
              disabled={isCreating}
            >
              {isCreating ? (
                "Processing..."
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
