"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, X, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { Section, Container } from "@classytic/clarity/layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/query";
import { formatPrice } from "@/lib/constants";
import { calculateItemPrice, getProductImage, getCartItemVariant, formatVariantAttributes } from "@/lib/commerce-utils";
import type { CartItem } from "@/types";

interface CartClientProps {
  token: string;
}

export default function CartClient({ token }: CartClientProps) {
  const { items, subtotal, isLoading, isUpdating, updateCartItem, removeCartItem, clearCart } = useCart(token);

  if (isLoading) {
    return (
      <Section padding="xl">
        <Container maxWidth="4xl">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </Container>
      </Section>
    );
  }

  if (!items?.length) {
    return (
      <Section padding="xl">
        <Container maxWidth="4xl">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Looks like you haven't added anything yet. Start exploring our collection.
            </p>
            <Button size="lg" asChild>
              <Link href="/products">
                Start Shopping <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section padding="lg">
      <Container>
        {/* Header */}
        <div className="flex items-end justify-between mb-10 pb-6 border-b border-border">
          <div>
            <h1 className="font-display text-4xl md:text-5xl">Shopping Cart</h1>
            <p className="text-muted-foreground mt-2">
              {items.length} {items.length === 1 ? "item" : "items"}
            </p>
          </div>
          <button
            onClick={() => clearCart()}
            disabled={isUpdating}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 disabled:opacity-50"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Cart Items */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="divide-y divide-border">
              {items.map((item: CartItem) => {
                const itemPrice = calculateItemPrice(item);
                const { product } = item;
                const variant = getCartItemVariant(item);
                const variantLabel = variant?.attributes ? formatVariantAttributes(variant.attributes) : null;

                return (
                  <div key={item._id} className="py-6 first:pt-0">
                    <div className="flex gap-4 md:gap-6">
                      {/* Image */}
                      <Link
                        href={`/products/${product?.slug || ""}`}
                        className="w-28 h-36 md:w-36 md:h-44 bg-muted overflow-hidden shrink-0 group relative"
                      >
                        <Image
                          src={getProductImage(product)}
                          alt={product?.name || "Product"}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 112px, 144px"
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Link
                              href={`/products/${product?.slug || ""}`}
                              className="font-medium text-lg hover:underline underline-offset-4"
                            >
                              {product?.name || "Product"}
                            </Link>
                            {/* Variant Info */}
                            {variantLabel && (
                              <div className="mt-2 text-sm text-muted-foreground">
                                {variantLabel}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeCartItem(item._id)}
                            disabled={isUpdating}
                            className="p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-50"
                            aria-label="Remove item"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="flex items-end justify-between mt-auto pt-4">
                          {/* Quantity */}
                          <div className="flex items-center border border-border">
                            <button
                              onClick={() => updateCartItem({ itemId: item._id, quantity: Math.max(1, item.quantity - 1) })}
                              disabled={isUpdating || item.quantity <= 1}
                              className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-12 h-10 flex items-center justify-center border-x border-border text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartItem({ itemId: item._id, quantity: item.quantity + 1 })}
                              disabled={isUpdating}
                              className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="font-display text-xl">{formatPrice(itemPrice * item.quantity)}</p>
                            {item.quantity > 1 && (
                              <p className="text-sm text-muted-foreground">{formatPrice(itemPrice)} each</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Continue Shopping */}
            <div className="mt-8 pt-6 border-t border-border">
              <Link href="/products" className="inline-flex items-center text-sm hover:underline underline-offset-4">
                <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-muted p-6 md:p-8 sticky top-32">
              <h2 className="font-display text-2xl mb-6">Order Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-muted-foreground">Calculated at checkout</span>
                </div>
                <div className="pt-4 border-t border-border flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-display text-2xl">{formatPrice(subtotal)}</span>
                </div>
              </div>

              <Button size="lg" className="w-full mt-6 h-14 text-base" disabled={isUpdating} asChild>
                <Link href="/checkout">
                  Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                Taxes and shipping calculated at checkout
              </p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
