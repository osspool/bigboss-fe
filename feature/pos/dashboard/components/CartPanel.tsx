"use client";

import { memo } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/constants";
import type { Customer } from "@/types";
import type { PosCartItem, PaymentOption, PaymentState, SplitPaymentEntry } from "@/types";
import { CartItems, CartSummary, CustomerSection, DiscountSection, PaymentSection, PointsRedemptionSection } from "./cart";

// ============= View Model Props =============

interface CartViewModel {
  items: PosCartItem[];
  subtotal: number;
  discount: number;
  tierDiscount?: number;
  tierName?: string | null;
  redemptionDiscount?: number;
  total: number;
  pointsToEarn?: number;
}

interface CustomerViewModel {
  selected: Customer | null;
  name: string;
  phone: string;
  membershipCardId: string;
  membershipStatus: "idle" | "searching" | "found" | "not_found";
  tierName?: string | null;
  tierColor?: string | null;
  tierTextColor?: string | null;
}

interface PaymentViewModel {
  options: PaymentOption[];
  isLoading: boolean;
  state: PaymentState;
  selectedOption: PaymentOption | null;
}

// ============= Cart Panel Props =============

interface DiscountAuthViewModel {
  isAuthorized: boolean;
  authorizedByName: string | null;
}

interface CartPanelProps {
  cart: CartViewModel;
  customer: CustomerViewModel;
  payment: PaymentViewModel;
  discountInput: string;
  pointsToRedeemInput: string;
  redemption: {
    enabled: boolean;
    pointsBalance: number;
    minRedeemPoints: number;
    maxRedeemPoints: number;
    pointsPerBdt: number;
    estimatedDiscount: number;
    error?: string | null;
  };
  discountAuth: DiscountAuthViewModel;
  isCheckingOut: boolean;
  // Cart actions
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  // Customer actions
  onCustomerNameChange: (value: string) => void;
  onCustomerPhoneChange: (value: string) => void;
  onMembershipChange: (value: string) => void;
  onMembershipLookup: () => void;
  onClearCustomer: () => void;
  onOpenCustomerLookup: () => void;
  // Discount
  onDiscountChange: (value: string) => void;
  onRequestDiscountAuth: () => void;
  onClearDiscountAuth: () => void;
  onPointsToRedeemChange: (value: string) => void;
  onUseMaxPoints: () => void;
  // Payment actions
  onSelectPayment: (key: string) => void;
  onPaymentModeChange: (mode: "single" | "split") => void;
  onCashChange: (value: string) => void;
  onReferenceChange: (value: string) => void;
  onSplitAdd: (paymentKey?: string) => void;
  onSplitUpdate: (id: string, patch: Partial<Pick<SplitPaymentEntry, "paymentKey" | "amount" | "reference">>) => void;
  onSplitRemove: (id: string) => void;
  // Checkout
  onCheckout: () => Promise<void>;
}

export const CartPanel = memo(function CartPanel({
  cart,
  customer,
  payment,
  discountInput,
  pointsToRedeemInput,
  redemption,
  discountAuth,
  isCheckingOut,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onMembershipChange,
  onMembershipLookup,
  onClearCustomer,
  onOpenCustomerLookup,
  onDiscountChange,
  onRequestDiscountAuth,
  onClearDiscountAuth,
  onPointsToRedeemChange,
  onUseMaxPoints,
  onSelectPayment,
  onPaymentModeChange,
  onCashChange,
  onReferenceChange,
  onSplitAdd,
  onSplitUpdate,
  onSplitRemove,
  onCheckout,
}: CartPanelProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Scrollable: Cart Items and Details */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <CartItems
          items={cart.items}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          onClear={onClearCart}
        />

        {cart.items.length > 0 && (
          <div className="border-t p-4 space-y-4 bg-card">
            <CartSummary
              subtotal={cart.subtotal}
              discount={cart.discount}
              tierDiscount={cart.tierDiscount || 0}
              tierName={cart.tierName || undefined}
              tierColor={customer.tierColor || undefined}
              redemptionDiscount={cart.redemptionDiscount || 0}
              total={cart.total}
              pointsToEarn={cart.pointsToEarn || 0}
            />

            <CustomerSection
              selected={customer.selected}
              name={customer.name}
              phone={customer.phone}
              membershipCardId={customer.membershipCardId}
              membershipStatus={customer.membershipStatus}
              tierName={customer.tierName}
              tierColor={customer.tierColor}
              tierTextColor={customer.tierTextColor}
              onNameChange={onCustomerNameChange}
              onPhoneChange={onCustomerPhoneChange}
              onMembershipChange={onMembershipChange}
              onMembershipLookup={onMembershipLookup}
              onClear={onClearCustomer}
              onOpenLookup={onOpenCustomerLookup}
            />

            <DiscountSection
              value={discountInput}
              onChange={onDiscountChange}
              isAuthorized={discountAuth.isAuthorized}
              authorizedByName={discountAuth.authorizedByName}
              onRequestAuth={onRequestDiscountAuth}
              onClearAuth={onClearDiscountAuth}
            />

            <PointsRedemptionSection
              enabled={redemption.enabled}
              pointsBalance={redemption.pointsBalance}
              minRedeemPoints={redemption.minRedeemPoints}
              maxRedeemPoints={redemption.maxRedeemPoints}
              pointsPerBdt={redemption.pointsPerBdt}
              estimatedDiscount={redemption.estimatedDiscount}
              error={redemption.error}
              value={pointsToRedeemInput}
              onChange={onPointsToRedeemChange}
              onUseMax={onUseMaxPoints}
            />

            <PaymentSection
              options={payment.options}
              isLoading={payment.isLoading}
              state={payment.state}
              selectedOption={payment.selectedOption}
              total={cart.total}
              onSelectPayment={onSelectPayment}
              onModeChange={onPaymentModeChange}
              onCashChange={onCashChange}
              onReferenceChange={onReferenceChange}
              onSplitAdd={onSplitAdd}
              onSplitUpdate={onSplitUpdate}
              onSplitRemove={onSplitRemove}
            />
          </div>
        )}
      </div>

      {/* Fixed: Checkout Button */}
      {cart.items.length > 0 && (
        <div className="border-t p-4 bg-card">
          <Button
            className="w-full h-12 text-base"
            onClick={onCheckout}
            disabled={isCheckingOut || cart.items.length === 0}
          >
            {isCheckingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Checkout • ${formatPrice(cart.total)}`
            )}
          </Button>
        </div>
      )}
    </div>
  );
});
