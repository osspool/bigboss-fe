"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CardWrapper } from "@/components/custom/ui/card-wrapper";
import { toast } from "sonner";
import { Tag, Check } from "lucide-react";
import { couponApi } from "@/api/platform/coupon-api";

const CouponSection = ({ onApplyCoupon, token, appliedCoupon, subtotal }) => {
  const [couponCode, setCouponCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.warning("Please enter a coupon code");
      return;
    }

    setIsLoading(true);
    try {
      const result = await couponApi.validateCoupon({
        code: couponCode,
        data: { orderAmount: subtotal },
        options: { token }
      });

      if (!result?.data) {
        toast.error("Invalid coupon code");
        return;
      }

      // Pass the validated coupon to parent
      onApplyCoupon(result.data);
      setCouponCode("");
      toast.success(`Coupon "${couponCode}" applied successfully!`);
    } catch (err) {
      toast.error(err.message || "Failed to apply coupon");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    onApplyCoupon(null);
    toast.success("Coupon removed");
  };

  return (
    <CardWrapper
      title="Discount Code"
      description="Enter a valid coupon code to get a discount"
    >
      {appliedCoupon ? (
        <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-success" />
            <span className="font-medium">{appliedCoupon.code}</span>
            <Badge variant="secondary" className="text-success">
              {appliedCoupon.discountType === 'percentage' 
                ? `${appliedCoupon.discountAmount}% OFF` 
                : `৳${appliedCoupon.discountAmount} OFF`
              }
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveCoupon}
            className="text-muted-foreground hover:text-destructive"
          >
            Remove
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter discount code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="pl-10"
              onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
            />
          </div>
          <Button 
            onClick={handleApplyCoupon} 
            disabled={isLoading || !couponCode.trim()}
          >
            {isLoading ? "Applying..." : "Apply"}
          </Button>
        </div>
      )}
    </CardWrapper>
  );
};

export default CouponSection;