import { FileText, User, CreditCard, Truck, Package, Info, Clock } from "lucide-react";
import { field, section } from "@/components/form/form-system";
import {
  ORDER_STATUS_VALUES,
  PAYMENT_STATUS_VALUES,
  PAYMENT_METHOD_VALUES,
  SHIPPING_PROVIDER_VALUES,
  SHIPPING_STATUS_VALUES,
} from "@/schemas/order.schema";

// ==================== Options from Schema Values ====================

export const ORDER_STATUS_OPTIONS = ORDER_STATUS_VALUES.map(v => ({ 
  value: v, 
  label: v.charAt(0).toUpperCase() + v.slice(1) 
}));

export const PAYMENT_STATUS_OPTIONS = PAYMENT_STATUS_VALUES.map(v => ({ 
  value: v, 
  label: v.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}));

export const PAYMENT_METHOD_OPTIONS = PAYMENT_METHOD_VALUES.map(v => ({
  value: v,
  label: v === 'bkash' ? 'bKash' : v === 'nagad' ? 'Nagad' : v === 'bank_transfer' ? 'Bank Transfer' : v.charAt(0).toUpperCase() + v.slice(1)
}));

export const SHIPPING_PROVIDER_OPTIONS = SHIPPING_PROVIDER_VALUES.map(v => ({
  value: v,
  label: v === 'sa_paribahan' ? 'SA Paribahan' : v.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}));

export const SHIPPING_STATUS_OPTIONS = SHIPPING_STATUS_VALUES.map(v => ({
  value: v,
  label: v.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}));

// ==================== Order Summary Schema (Editable) ====================

export const orderSummarySchema = {
  sections: [
    section("summary", "Order Status", [
      field.select("status", "Order Status", ORDER_STATUS_OPTIONS, {
        description: "Update order status (prefer using status action buttons)",
      }),
      field.textarea("notes", "Admin Notes", {
        fullWidth: true,
        rows: 3,
        placeholder: "Internal notes about this order...",
      }),
    ], {
      icon: <FileText className="w-4 h-4" />,
      variant: "card",
      cols: 1,
    })
  ]
};

// ==================== Delivery Address Schema (Editable) ====================

export const deliveryAddressSchema = {
  sections: [
    section("deliveryAddress", "Delivery Address", [
      field.text("deliveryAddress.label", "Address Label", {
        placeholder: "e.g., Home, Office",
        description: "Optional label for this address",
      }),
      field.text("deliveryAddress.recipientName", "Recipient Name", {
        placeholder: "Full name",
        description: "For gift orders or different recipient",
      }),
      field.tel("deliveryAddress.recipientPhone", "Recipient Phone", {
        required: true,
        placeholder: "01XXXXXXXXX",
        description: "Contact phone for delivery",
      }),
      field.text("deliveryAddress.addressLine1", "Address Line 1", {
        required: true,
        placeholder: "Street address, building, etc.",
      }),
      field.text("deliveryAddress.addressLine2", "Address Line 2", {
        placeholder: "Apartment, suite, unit, etc.",
      }),
      field.text("deliveryAddress.city", "City", {
        required: true,
        placeholder: "City name",
      }),
      field.text("deliveryAddress.division", "Division", {
        placeholder: "e.g., Dhaka, Chittagong",
        description: "Division name (API uses 'division')",
      }),
      field.text("deliveryAddress.postalCode", "Postal Code", {
        placeholder: "Postal/ZIP code",
      }),
      field.text("deliveryAddress.country", "Country", {
        placeholder: "Bangladesh",
        description: "Defaults to Bangladesh",
      }),
    ], {
      icon: <User className="w-4 h-4" />,
      variant: "card",
      cols: 2,
    })
  ]
};

// ==================== Delivery Method Schema (Editable) ====================

export const deliveryMethodSchema = {
  sections: [
    section("delivery", "Delivery Method", [
      field.text("delivery.method", "Method Name", {
        required: true,
        placeholder: "e.g., Standard, Express",
      }),
      field.number("delivery.price", "Delivery Fee (BDT)", {
        required: true,
        min: 0,
        placeholder: "0",
      }),
      field.number("delivery.estimatedDays", "Estimated Days", {
        min: 1,
        placeholder: "3",
      }),
    ], {
      icon: <Truck className="w-4 h-4" />,
      variant: "card",
      cols: 3,
    })
  ]
};

// ==================== Shipping Schema (Editable via endpoints) ====================

export const shippingSchema = {
  sections: [
    section("shipping", "Shipping Information", [
      field.select("shipping.provider", "Shipping Provider", SHIPPING_PROVIDER_OPTIONS, {
        description: "Courier service provider",
      }),
      field.select("shipping.status", "Shipping Status", SHIPPING_STATUS_OPTIONS, {
        description: "Current shipping status (updated automatically)",
        disabled: true, // Status is managed via shipping endpoints
      }),
      field.text("shipping.trackingNumber", "Tracking Number", {
        placeholder: "e.g., PATHAO123456",
      }),
      field.text("shipping.trackingUrl", "Tracking URL", {
        placeholder: "https://...",
      }),
      field.text("shipping.consignmentId", "Consignment ID", {
        placeholder: "e.g., CN-123456",
      }),
      field.date("shipping.estimatedDelivery", "Estimated Delivery", {
        description: "Expected delivery date",
      }),
    ], {
      icon: <Package className="w-4 h-4" />,
      variant: "card",
      cols: 2,
    })
  ]
};

// ==================== Read-Only Schemas (for display) ====================

/**
 * Payment info schema (READ-ONLY - system managed)
 * Displayed for reference but not editable in form
 */
export const paymentInfoFields = {
  sections: [
    section("currentPayment", "Payment Information (Read-Only)", [
      field.select("currentPayment.method", "Payment Method", PAYMENT_METHOD_OPTIONS, {
        disabled: true,
        description: "Set at checkout",
      }),
      field.select("currentPayment.status", "Payment Status", PAYMENT_STATUS_OPTIONS, {
        disabled: true,
        description: "Managed by payment workflows",
      }),
      field.text("currentPayment.reference", "Transaction Reference", {
        disabled: true,
        description: "Customer's TrxID",
      }),
      field.number("currentPayment.amount", "Amount (BDT)", {
        disabled: true,
        description: "Payment amount",
      }),
    ], {
      icon: <CreditCard className="w-4 h-4" />,
      variant: "muted",
      cols: 2,
    })
  ]
};

// ==================== Order Items Display ====================

/**
 * Get item display fields (READ-ONLY)
 */
export const getItemDisplayFields = (index) => [
  field.text(`items.${index}.productName`, "Product", {
    disabled: true,
  }),
  field.number(`items.${index}.quantity`, "Qty", {
    disabled: true,
  }),
  field.number(`items.${index}.price`, "Price (BDT)", {
    disabled: true,
  }),
];

// ==================== Combined Admin Order Form Schema ====================

export const adminOrderFormSchema = {
  tabs: [
    { id: "summary", label: "Summary", icon: <FileText className="w-4 h-4" /> },
    { id: "payment", label: "Payment", icon: <CreditCard className="w-4 h-4" /> },
    { id: "delivery", label: "Delivery", icon: <Truck className="w-4 h-4" /> },
    { id: "shipping", label: "Shipping", icon: <Package className="w-4 h-4" /> },
    { id: "timeline", label: "Timeline", icon: <Clock className="w-4 h-4" /> },
    { id: "info", label: "Info", icon: <Info className="w-4 h-4" /> },
  ],
  sections: {
    summary: orderSummarySchema.sections,
    payment: [], // Rendered separately with verification actions
    delivery: [...deliveryAddressSchema.sections, ...deliveryMethodSchema.sections],
    shipping: shippingSchema.sections,
    timeline: [], // Rendered separately with timeline display
    info: [], // Rendered separately with read-only system info
  },
  fieldRules: {
    // System-managed fields - view only, not editable
    customer: { systemManaged: true },
    customerName: { systemManaged: true },
    customerPhone: { systemManaged: true },
    customerEmail: { systemManaged: true },
    userId: { systemManaged: true },
    currentPayment: { systemManaged: true },
    items: { systemManaged: true },
    subtotal: { systemManaged: true },
    discountAmount: { systemManaged: true },
    totalAmount: { systemManaged: true },
    couponApplied: { systemManaged: true },
    cancellationRequest: { systemManaged: true },
    timeline: { systemManaged: true },
    createdAt: { systemManaged: true },
    updatedAt: { systemManaged: true },
    isGift: { systemManaged: true },
  },
};
