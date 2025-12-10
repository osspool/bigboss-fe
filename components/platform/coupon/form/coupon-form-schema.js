import { Info, Tag, Calendar, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { field, section } from "@/components/form/form-system";
import { format } from "date-fns";
import { DISCOUNT_TYPE_VALUES } from "@/schemas/coupon.schema";

// Discount type options for select
const DISCOUNT_TYPE_OPTIONS = [
  { value: "percentage", label: "Percentage (%)" },
  { value: "fixed", label: "Fixed Amount (৳)" },
];

/**
 * Create coupon form schema
 * @param {Object} options - Schema options
 * @param {boolean} options.isEdit - Whether this is an edit form
 * @param {Object} options.coupon - Existing coupon (for edit mode)
 * @returns {Object} Form schema
 */
export const createCouponFormSchema = ({
  isEdit = false,
  coupon = null,
}) => {
  return {
    sections: [
      // Alert for edit mode
      ...(isEdit ? [
        {
          id: "alert",
          render: () => (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                System-managed fields (Used Count, Timestamps) are read-only and automatically maintained by the system.
              </AlertDescription>
            </Alert>
          ),
        },
      ] : []),

      // Basic Coupon Information Section
      section(
        "basic",
        "Coupon Details",
        [
          field.text("code", "Coupon Code", {
            placeholder: "SUMMER10",
            required: true,
            description: "Unique code customers will use (automatically converted to uppercase)",
            transform: (value) => value.toUpperCase(),
          }),
          field.select("discountType", "Discount Type", DISCOUNT_TYPE_OPTIONS, {
            placeholder: "Select discount type",
            required: true,
          }),
          field.number("discountAmount", "Discount Amount", {
            placeholder: "10",
            required: true,
            min: 0,
            step: 0.01,
            description: (watch) => {
              const type = watch?.("discountType");
              if (type === "percentage") {
                return "Enter percentage value (e.g., 10 for 10%)";
              } else if (type === "fixed") {
                return "Enter fixed amount in Taka (৳)";
              }
              return "Select discount type first";
            },
          }),
        ],
        { cols: 3 }
      ),

      // Discount Rules Section
      section(
        "rules",
        "Discount Rules",
        [
          field.number("minOrderAmount", "Minimum Order Amount", {
            placeholder: "0",
            min: 0,
            step: 0.01,
            description: "Minimum order total required to use this coupon (in ৳)",
          }),
          field.number("maxDiscountAmount", "Maximum Discount Cap", {
            placeholder: "500",
            min: 0,
            step: 0.01,
            description: (watch) => {
              const type = watch?.("discountType");
              if (type === "percentage") {
                return "Maximum discount amount cap for percentage discounts (in ৳)";
              }
              return "Not applicable for fixed discounts";
            },
            show: (watch) => watch?.("discountType") === "percentage",
          }),
        ],
        { cols: 2 }
      ),

      // Validity & Usage Section
      section(
        "validity",
        "Validity & Usage",
        [
          field.date("expiresAt", "Expiration Date", {
            placeholder: "Select expiration date",
            required: true,
            description: "Coupon will expire after this date",
          }),
          field.number("usageLimit", "Usage Limit", {
            placeholder: "100",
            required: true,
            min: 1,
            step: 1,
            description: "Maximum number of times this coupon can be used",
          }),
          field.switch("isActive", "Active Status", {
            description: "Enable or disable this coupon",
          }),
        ],
        { cols: 3 }
      ),

      // Read-only System Information (only when editing)
      ...(isEdit && coupon ? [
        {
          id: "systemInfo",
          title: "System Information",
          render: () => (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Coupon ID */}
                {coupon._id && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Coupon ID</label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono truncate">
                      {coupon._id}
                    </div>
                  </div>
                )}

                {/* Usage Stats */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Usage Statistics
                  </label>
                  <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                    <span className="font-medium">{coupon.usedCount || 0}</span>
                    <span className="text-muted-foreground mx-1">/</span>
                    <span className="text-muted-foreground">{coupon.usageLimit || 100} used</span>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              {(coupon.createdAt || coupon.updatedAt) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {coupon.createdAt && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created At
                      </label>
                      <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                        {format(new Date(coupon.createdAt), 'PPp')}
                      </div>
                    </div>
                  )}
                  {coupon.updatedAt && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Updated At
                      </label>
                      <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                        {format(new Date(coupon.updatedAt), 'PPp')}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Expiration Status */}
              {coupon.expiresAt && (
                <div className="pt-2">
                  <div className={`p-3 rounded-md border ${
                    new Date(coupon.expiresAt) < new Date()
                      ? 'bg-destructive/10 border-destructive/20'
                      : 'bg-green-500/10 border-green-500/20'
                  }`}>
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      {new Date(coupon.expiresAt) < new Date() ? 'Expired' : 'Valid Until'}
                    </label>
                    <div className="text-sm mt-1">
                      {format(new Date(coupon.expiresAt), 'PPP')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ),
        },
      ] : []),
    ],
  };
};
