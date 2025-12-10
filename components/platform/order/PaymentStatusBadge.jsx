"use client";

import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, RefreshCw, AlertCircle } from "lucide-react";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  payment_initiated: {
    label: "Initiated",
    icon: RefreshCw,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  processing: {
    label: "Processing",
    icon: RefreshCw,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  requires_action: {
    label: "Action Required",
    icon: AlertCircle,
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  verified: {
    label: "Verified",
    icon: CheckCircle,
    className: "bg-green-50 text-green-700 border-green-200",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    className: "bg-green-50 text-green-700 border-green-200",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className: "bg-red-50 text-red-700 border-red-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-gray-50 text-gray-700 border-gray-200",
  },
  expired: {
    label: "Expired",
    icon: Clock,
    className: "bg-gray-50 text-gray-700 border-gray-200",
  },
  refunded: {
    label: "Refunded",
    icon: RefreshCw,
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  partially_refunded: {
    label: "Partially Refunded",
    icon: RefreshCw,
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
};

const DOT_COLORS = {
  pending: "bg-yellow-500",
  payment_initiated: "bg-blue-500",
  processing: "bg-blue-500",
  requires_action: "bg-orange-500",
  verified: "bg-green-500",
  completed: "bg-green-500",
  failed: "bg-red-500",
  cancelled: "bg-gray-500",
  expired: "bg-gray-500",
  refunded: "bg-purple-500",
  partially_refunded: "bg-purple-500",
};

/**
 * Unified payment status badge component
 * Works for all payment types (Order, Enrollment, Subscription)
 */
export const PaymentStatusBadge = memo(function PaymentStatusBadge({ status, className = "" }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.className} ${className} inline-flex items-center gap-1.5`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
});

/**
 * Simplified payment status dot for compact displays
 */
export const PaymentStatusDot = memo(function PaymentStatusDot({ status, className = "" }) {
  const dotColor = DOT_COLORS[status] || DOT_COLORS.pending;

  return (
    <span className={`inline-block h-2 w-2 rounded-full ${dotColor} ${className}`} title={status} />
  );
});
