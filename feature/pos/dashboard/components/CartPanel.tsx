"use client";

import { memo, useMemo } from "react";
import { Banknote, CreditCard, Loader2, ShoppingCart, Smartphone, UserSearch, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/constants";
import type { PaymentMethodConfig } from "@/types/common.types";
import type { Customer } from "@/types/customer.types";
import type { PosCartItem, PosPaymentMethod } from "../pos.types";
import { getPaymentKey, mapPlatformMethodToPosMethod } from "../pos-payment";

interface CartPanelProps {
  cart: PosCartItem[];
  cartSummary: { subtotal: number; discount: number; total: number; itemCount: number };
  isCreatingOrder: boolean;
  onCheckout: () => Promise<void>;
  onClearCart: () => void;
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  paymentMethods: PaymentMethodConfig[];
  paymentMethodsLoading: boolean;
  selectedPaymentKey: string | null;
  onSelectPaymentKey: (key: string) => void;
  selectedPosPaymentMethod: PosPaymentMethod;
  paymentReference: string;
  onPaymentReferenceChange: (v: string) => void;
  cashReceived: string;
  onCashReceivedChange: (v: string) => void;
  changeAmount: number;
  amountDue: number;
  selectedCustomer: Customer | null;
  onClearCustomer: () => void;
  onOpenCustomerLookup: () => void;
  customerName: string;
  onCustomerNameChange: (v: string) => void;
  customerPhone: string;
  onCustomerPhoneChange: (v: string) => void;
  discount: string;
  onDiscountChange: (v: string) => void;
}

function paymentIcon(posMethod: PosPaymentMethod) {
  switch (posMethod) {
    case "cash":
      return Banknote;
    case "bkash":
    case "nagad":
      return Smartphone;
    case "card":
      return CreditCard;
    default:
      return Banknote;
  }
}

export const CartPanel = memo(function CartPanel({
  cart,
  cartSummary,
  isCreatingOrder,
  onCheckout,
  onClearCart,
  onUpdateQuantity,
  onRemoveItem,
  paymentMethods,
  paymentMethodsLoading,
  selectedPaymentKey,
  onSelectPaymentKey,
  selectedPosPaymentMethod,
  paymentReference,
  onPaymentReferenceChange,
  cashReceived,
  onCashReceivedChange,
  changeAmount,
  amountDue,
  selectedCustomer,
  onClearCustomer,
  onOpenCustomerLookup,
  customerName,
  onCustomerNameChange,
  customerPhone,
  onCustomerPhoneChange,
  discount,
  onDiscountChange,
}: CartPanelProps) {
  const paymentOptions = useMemo(() => {
    return paymentMethods
      .map((m, idx) => {
        const key = getPaymentKey(m, idx);
        const posMethod = mapPlatformMethodToPosMethod(m);
        if (!posMethod) return null;
        return { key, method: m, posMethod };
      })
      .filter(Boolean) as Array<{ key: string; method: PaymentMethodConfig; posMethod: PosPaymentMethod }>;
  }, [paymentMethods]);

  const selectedOption = useMemo(() => {
    if (paymentOptions.length === 0) return null;
    return paymentOptions.find((p) => p.key === selectedPaymentKey) || paymentOptions[0];
  }, [paymentOptions, selectedPaymentKey]);

  const SelectedIcon = paymentIcon(selectedPosPaymentMethod);

  const cashSuggestions = useMemo(() => {
    if (selectedPosPaymentMethod !== "cash") return [];
    const total = Math.ceil(cartSummary.total);
    if (!Number.isFinite(total) || total <= 0) return [];

    const roundUp = (value: number, step: number) => Math.ceil(value / step) * step;
    const candidates = [
      total,
      roundUp(total, 50),
      roundUp(total, 100),
      roundUp(total, 500),
      roundUp(total, 1000),
    ];
    return Array.from(new Set(candidates)).sort((a, b) => a - b).slice(0, 5);
  }, [cartSummary.total, selectedPosPaymentMethod]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Cart ({cart.length})
          </h2>
          {cart.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearCart} className="h-8 text-xs">
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Cart is empty</p>
          </div>
        ) : (
          cart.map((item, index) => (
            <CartItem
              key={`${item.productId}-${item.variantSku || "simple"}`}
              item={item}
              onUpdateQuantity={(delta) => onUpdateQuantity(index, delta)}
              onRemove={() => onRemoveItem(index)}
            />
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="border-t p-4 space-y-4 bg-card">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatPrice(cartSummary.subtotal)}</span>
            </div>
            {cartSummary.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium">-{formatPrice(cartSummary.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(cartSummary.total)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Customer</p>
              {selectedCustomer && (
                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onClearCustomer}>
                  <X className="h-3.5 w-3.5 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {selectedCustomer ? (
              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{selectedCustomer.name || "Customer"}</p>
                    <p className="text-xs text-muted-foreground">{selectedCustomer.phone}</p>
                  </div>
                  {selectedCustomer.tier && (
                    <Badge variant="secondary" className="capitalize">
                      {selectedCustomer.tier}
                    </Badge>
                  )}
                </div>
                {selectedCustomer.stats?.orders?.total != null && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Orders: {selectedCustomer.stats.orders.total}
                  </p>
                )}
              </div>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10 justify-between"
                  onClick={onOpenCustomerLookup}
                >
                  <span className="text-sm text-muted-foreground">Find customer (phone or name)</span>
                  <UserSearch className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Input
                  placeholder="Customer name (optional)"
                  value={customerName}
                  onChange={(e) => onCustomerNameChange(e.target.value)}
                />
                <Input
                  placeholder="Phone (01XXXXXXXXX)"
                  inputMode="numeric"
                  value={customerPhone}
                  onChange={(e) => onCustomerPhoneChange(e.target.value)}
                />
              </>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Sale details</p>
            <Input
              placeholder="Discount (BDT)"
              inputMode="numeric"
              value={discount}
              onChange={(e) => onDiscountChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Payment</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <SelectedIcon className="h-3.5 w-3.5" />
                <span className="capitalize">
                  {selectedPosPaymentMethod.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            {paymentMethodsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : paymentOptions.length === 0 ? (
              <div className="text-xs text-muted-foreground">
                No active payment methods configured in platform settings.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {paymentOptions.map((opt) => (
                  <Button
                    key={opt.key}
                    type="button"
                    variant={selectedOption?.key === opt.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSelectPaymentKey(opt.key)}
                    className="h-9"
                  >
                    {opt.method.name}
                  </Button>
                ))}
              </div>
            )}

            {selectedOption?.method?.note && (
              <p className="text-xs text-muted-foreground">{selectedOption.method.note}</p>
            )}
            {selectedOption?.method?.type === "mfs" && selectedOption.method.walletNumber && (
              <p className="text-xs text-muted-foreground">
                Wallet: <span className="font-medium">{selectedOption.method.walletNumber}</span>
              </p>
            )}
            {selectedPosPaymentMethod === "cash" ? (
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <Input
                    placeholder="Cash received (BDT)"
                    inputMode="numeric"
                    value={cashReceived}
                    onChange={(e) => onCashReceivedChange(e.target.value)}
                  />
                </div>
                {cashSuggestions.length > 0 && (
                  <div className="col-span-2 flex flex-wrap gap-2">
                    {cashSuggestions.map((amt) => (
                      <Button
                        key={amt}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => onCashReceivedChange(String(amt))}
                      >
                        {amt === Math.ceil(cartSummary.total) ? "Exact" : formatPrice(amt)}
                      </Button>
                    ))}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Due:{" "}
                  <span className={amountDue > 0 ? "text-destructive font-medium" : "font-medium"}>
                    {formatPrice(amountDue)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  Change: <span className="font-medium">{formatPrice(changeAmount)}</span>
                </div>
              </div>
            ) : (
              <Input
                placeholder={
                  selectedPosPaymentMethod === "card"
                    ? "Card reference (Slip/Auth No.)"
                    : "MFS reference (Txn ID)"
                }
                value={paymentReference}
                onChange={(e) => onPaymentReferenceChange(e.target.value)}
              />
            )}
          </div>

          <Button
            className="w-full h-12 text-base"
            onClick={onCheckout}
            disabled={isCreatingOrder || cart.length === 0}
          >
            {isCreatingOrder ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Checkout • ${formatPrice(cartSummary.total)}`
            )}
          </Button>
        </div>
      )}
    </div>
  );
});

interface CartItemProps {
  item: PosCartItem;
  onUpdateQuantity: (delta: number) => void;
  onRemove: () => void;
}

function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex gap-3 p-3 rounded-lg border bg-card">
      <div className="w-16 h-16 rounded bg-muted overflow-hidden shrink-0">
        <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium truncate">{item.productName}</h4>
        {item.variantLabel && <p className="text-xs text-muted-foreground">{item.variantLabel}</p>}
        <div className="flex items-center gap-2 mt-2">
          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => onUpdateQuantity(-1)}>
            -
          </Button>
          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => onUpdateQuantity(1)}>
            +
          </Button>
          <Button variant="ghost" size="sm" className="h-6 ml-auto text-xs" onClick={onRemove}>
            Remove
          </Button>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold">{formatPrice(item.lineTotal)}</p>
        <p className="text-xs text-muted-foreground">{formatPrice(item.unitPrice)} each</p>
      </div>
    </div>
  );
}
