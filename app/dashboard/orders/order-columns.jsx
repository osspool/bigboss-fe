"use client";

import React from "react";
import {
  Hash,
  User,
  ShoppingBag,
  CreditCard,
  CalendarClock,
  Pencil,
  Trash2,
  Eye,
  Truck,
  XCircle,
  CheckCircle,
} from "lucide-react";

import { ActionDropdown } from "@/components/custom/ui/dropdown-wrapper";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/constants";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/constants/enums/monetization.enum";

// ==================== Cell Components ====================

const OrderIdCell = React.memo(({ item }) => {
  const orderId = item._id || "";
  const shortId = orderId.length > 8 ? `...${orderId.slice(-8)}` : orderId;
  
  return (
    <div className="flex flex-col gap-1 text-sm">
      <div className="flex items-center gap-2 font-medium text-foreground">
        <Hash className="h-4 w-4 text-muted-foreground" />
        <span className="truncate font-mono text-xs" title={orderId}>{shortId}</span>
      </div>
      <StatusBadge status={item.status} />
    </div>
  );
});
OrderIdCell.displayName = "OrderIdCell";

const StatusBadge = React.memo(({ status }) => {
  const color = ORDER_STATUS_COLORS[status] || "default";
  const label = ORDER_STATUS_LABELS[status] || status;
  
  return (
    <Badge variant={color} className="w-fit text-xs capitalize">
      {label}
    </Badge>
  );
});
StatusBadge.displayName = "StatusBadge";

const CustomerCell = React.memo(({ item }) => {
  const address = item.deliveryAddress || {};
  const recipientName = address.recipientName || "—";
  const phone = address.phone || "";
  
  return (
    <div className="flex flex-col gap-1 text-sm">
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{recipientName}</span>
      </div>
      {phone && (
        <span className="text-xs text-muted-foreground">{phone}</span>
      )}
    </div>
  );
});
CustomerCell.displayName = "CustomerCell";

const ItemsCell = React.memo(({ item }) => {
  const items = Array.isArray(item.items) ? item.items : [];
  const count = items.length;
  const firstItem = items[0];
  const preview = firstItem?.productName || null;
  
  return (
    <div className="flex items-center gap-2 text-sm">
      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
      <div className="flex flex-col">
        <span className="font-medium">{count} item{count === 1 ? "" : "s"}</span>
        {preview && (
          <span className="text-xs text-muted-foreground truncate max-w-[150px]" title={preview}>
            {preview}
          </span>
        )}
      </div>
    </div>
  );
});
ItemsCell.displayName = "ItemsCell";

const PaymentCell = React.memo(({ item }) => {
  const payment = item.currentPayment || {};
  // currentPayment.amount is in paisa (smallest unit), convert to BDT
  // If not available, fall back to totalAmount which is already in BDT
  const amount = payment.amount ? payment.amount / 100 : (item.totalAmount || 0);
  const status = payment.status || "pending";
  const method = payment.method || "cash";

  const statusColors = {
    pending: "warning",
    verified: "success",
    failed: "destructive",
    refunded: "secondary",
    partially_refunded: "secondary",
    cancelled: "destructive",
  };

  return (
    <div className="flex flex-col gap-1 text-sm">
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-muted-foreground" />
        <span className="font-semibold">{formatPrice(amount)}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground capitalize">{method}</span>
        <Badge variant={statusColors[status] || "default"} className="text-xs">
          {status}
        </Badge>
      </div>
    </div>
  );
});
PaymentCell.displayName = "PaymentCell";

const TotalCell = React.memo(({ item }) => {
  const total = item.totalAmount || 0;
  const subtotal = item.subtotal || 0;
  const discount = item.discountAmount || 0;
  
  return (
    <div className="flex flex-col gap-1 text-sm">
      <span className="font-semibold text-primary">{formatPrice(total)}</span>
      <span className="text-xs text-muted-foreground">
        Sub: {formatPrice(subtotal)}
        {discount > 0 && ` (-${formatPrice(discount)})`}
      </span>
    </div>
  );
});
TotalCell.displayName = "TotalCell";

const DeliveryCell = React.memo(({ item }) => {
  const delivery = item.delivery || {};
  const address = item.deliveryAddress || {};
  const method = delivery.method || "—";
  const city = address.city || "";
  
  return (
    <div className="flex items-center gap-2 text-sm">
      <Truck className="h-4 w-4 text-muted-foreground" />
      <div className="flex flex-col">
        <span className="font-medium capitalize">{method}</span>
        {city && <span className="text-xs text-muted-foreground">{city}</span>}
      </div>
    </div>
  );
});
DeliveryCell.displayName = "DeliveryCell";

const DateCell = React.memo(({ item }) => {
  const createdAt = item.createdAt ? new Date(item.createdAt) : null;
  const isValid = createdAt && !Number.isNaN(createdAt.getTime());
  
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <CalendarClock className="h-4 w-4" />
      <span>
        {isValid 
          ? createdAt.toLocaleDateString("en-US", { 
              month: "short", 
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            }) 
          : "—"
        }
      </span>
    </div>
  );
});
DateCell.displayName = "DateCell";

// ==================== Column Definitions ====================

export const orderColumns = (onView, onEdit, onDelete, onStatusChange) => [
  {
    id: "order",
    header: "Order",
    cell: ({ row }) => <OrderIdCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: "customer",
    header: "Customer",
    cell: ({ row }) => <CustomerCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: "items",
    header: "Items",
    cell: ({ row }) => <ItemsCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: "payment",
    header: "Payment",
    cell: ({ row }) => <PaymentCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: "total",
    header: "Total",
    cell: ({ row }) => <TotalCell item={row.original} />,
    enableSorting: true,
  },
  {
    id: "delivery",
    header: "Delivery",
    cell: ({ row }) => <DeliveryCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: "createdAt",
    header: "Created",
    cell: ({ row }) => <DateCell item={row.original} />,
    enableSorting: true,
  },
  {
    id: "actions",
    header: <div className="text-center">Actions</div>,
    enableSorting: false,
    cell: ({ row }) => {
      const item = row.original;
      const canCancel = item.status !== "cancelled" && item.status !== "delivered";
      const canConfirm = item.status === "pending" || item.status === "processing";
      const canShip = item.status === "confirmed";
      const canDeliver = item.status === "shipped";

      const items = [
        {
          label: "View Details",
          icon: Eye,
          onClick: () => onView?.(item),
        },
        {
          label: "Edit",
          icon: Pencil,
          onClick: () => onEdit?.(item),
        },
        { type: "separator" },
        // Status actions
        canConfirm && {
          label: "Confirm Order",
          icon: CheckCircle,
          onClick: () => onStatusChange?.(item, "confirmed"),
        },
        canShip && {
          label: "Mark Shipped",
          icon: Truck,
          onClick: () => onStatusChange?.(item, "shipped"),
        },
        canDeliver && {
          label: "Mark Delivered",
          icon: CheckCircle,
          onClick: () => onStatusChange?.(item, "delivered"),
        },
        canCancel && {
          label: "Cancel Order",
          icon: XCircle,
          variant: "warning",
          onClick: () => onStatusChange?.(item, "cancelled"),
        },
        { type: "separator" },
        {
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          onClick: () => onDelete?.(item),
        },
      ].filter(Boolean);

      return (
        <div className="flex items-center justify-center">
          <ActionDropdown items={items} />
        </div>
      );
    },
  },
];
