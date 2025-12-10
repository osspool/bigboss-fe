"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    // If no order ID, redirect to home
    if (!orderId) {
      router.push("/");
    }
  }, [orderId, router]);

  if (!orderId) {
    return null;
  }

  return (
    <Container className="py-16">
      <div className="max-w-2xl mx-auto">
        <Card className="border-success/20">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <div>
              <CardTitle className="text-3xl mb-2">Order Confirmed!</CardTitle>
              <CardDescription className="text-base">
                Thank you for your purchase. Your order has been successfully placed.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Order ID */}
            <div className="bg-muted/50 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Order Number</p>
              <p className="text-xl font-mono font-semibold break-all">
                #{orderId.toUpperCase()}
              </p>
            </div>

            {/* What's Next */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Package className="w-5 h-5" />
                What happens next?
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-success">✓</span>
                  <span>You will receive an order confirmation email shortly</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-success">✓</span>
                  <span>We'll process your order and prepare it for shipping</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-success">✓</span>
                  <span>You'll get tracking information once your order ships</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild className="flex-1">
                <Link href={`/profile/my-orders`}>
                  View Order Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>

            <div className="pt-4 border-t text-center text-sm text-muted-foreground">
              Need help? Contact our{" "}
              <Link href="/contact" className="text-primary hover:underline">
                customer support
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
