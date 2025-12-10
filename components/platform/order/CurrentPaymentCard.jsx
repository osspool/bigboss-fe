"use client";

import { memo } from "react";
import { CreditCard, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * CurrentPaymentCard - Unified payment status display
 * Shows payment amount, status, method, and transaction details
 */
export const CurrentPaymentCard = memo(function CurrentPaymentCard({
  currentPayment,
  title = "Payment Status",
  currency = "BDT",
  showTransactionId = true,
  className,
}) {
  if (!currentPayment) return null;

  // Convert paisa to BDT if needed
  const amount = currentPayment.amount ? currentPayment.amount / 100 : 0;
  const status = currentPayment.status || "pending";
  const method = currentPayment.method || "cash";
  const reference = currentPayment.reference || currentPayment.transactionId;

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified":
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      case "failed":
      case "cancelled":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "verified":
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className={cn("rounded-lg border bg-muted/30 p-4 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold">{title}</h4>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(status)}
          <Badge variant={getStatusVariant(status)} className="capitalize">
            {status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Amount</div>
          <div className="font-semibold text-lg">{formatPrice(amount)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Method</div>
          <div className="font-medium capitalize">{method}</div>
        </div>
        {showTransactionId && reference && (
          <div className="col-span-2 md:col-span-1">
            <div className="text-xs text-muted-foreground mb-1">Transaction ID</div>
            <div className="font-mono text-xs bg-background px-2 py-1 rounded border truncate" title={reference}>
              {reference.length > 12 ? `${reference.slice(0, 6)}...${reference.slice(-6)}` : reference}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
