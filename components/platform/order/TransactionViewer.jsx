"use client";

import { useState, useMemo, memo } from "react";
import { format } from "date-fns";
import { useTransactionsByReference } from "@/hooks/query";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { Receipt, Eye, CreditCard, Loader2, Wallet, Building2, User } from "lucide-react";
import { CardWrapper, DialogWrapper } from "@classytic/clarity";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Transaction viewer component
 * Displays transaction history for an Order, Enrollment, or Subscription
 */
export function TransactionViewer({
  referenceModel,
  referenceId,
  token,
  title = "Payment History",
  compact = false,
}) {
  const { transactions, isLoading } = useTransactionsByReference({
    token,
    referenceModel,
    referenceId,
  });

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <CardWrapper
        title={title}
        size="sm"
        className="border-dashed"
      >
        <div className="text-center py-6 text-muted-foreground">
          <Receipt className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No transactions found</p>
        </div>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper
      title={title}
      description={`${transactions.length} transaction${transactions.length !== 1 ? "s" : ""}`}
      size="sm"
      contentClassName="!pt-3"
    >
      <div className="space-y-2">
        {sortedTransactions.map((transaction) => (
          <TransactionItem key={transaction._id} transaction={transaction} compact={compact} />
        ))}
      </div>
    </CardWrapper>
  );
}

/**
 * Individual transaction item with details dialog
 */
const TransactionItem = memo(function TransactionItem({ transaction, compact }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <div className={cn(
        "flex items-center justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors",
        compact && "p-2"
      )}>
        {/* Left: Amount & Status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="text-base font-semibold whitespace-nowrap">
            ৳{transaction.amount?.toLocaleString()}
          </div>
          <PaymentStatusBadge status={transaction.status} />
        </div>

        {/* Right: Method, Date, View Button */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
          <span className="hidden sm:inline capitalize">{transaction.method}</span>
          <span className="text-xs hidden md:inline">
            {format(new Date(transaction.createdAt), "MMM dd, HH:mm")}
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => setShowDetails(true)}
            title="View payment details"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Payment Details Dialog */}
      <TransactionDetailsDialog
        transaction={transaction}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </>
  );
});

/**
 * Transaction details dialog for admin verification
 */
function TransactionDetailsDialog({ transaction, open, onOpenChange }) {
  const hasPaymentDetails = transaction.paymentDetails && Object.keys(transaction.paymentDetails).length > 0;

  return (
    <DialogWrapper
      open={open}
      onOpenChange={onOpenChange}
      title="Payment Details"
      description="Transaction information for verification"
      size="default"
    >
      <div className="space-y-4">
        {/* Transaction Info */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-lg">৳{transaction.amount?.toLocaleString()}</h4>
            <PaymentStatusBadge status={transaction.status} />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Transaction ID</div>
              <div className="font-mono text-xs break-all">{transaction._id}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Date</div>
              <div>{format(new Date(transaction.createdAt), "MMM dd, yyyy HH:mm")}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Method</div>
              <div className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                <span className="capitalize">{transaction.method}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Category</div>
              <Badge variant="outline" className="text-xs">
                {transaction.category?.replace(/_/g, " ")}
              </Badge>
            </div>
          </div>

          {transaction.reference && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Transaction Reference</div>
              <div className="font-mono text-sm bg-background px-2 py-1 rounded border">
                {transaction.reference}
              </div>
            </div>
          )}
        </div>

        {/* Payment Details */}
        {hasPaymentDetails && (
          <div className="rounded-lg border p-4 space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Payment Details
            </h4>

            <div className="space-y-2 text-sm">
              {/* Wallet Payment Details */}
              {transaction.paymentDetails.walletNumber && (
                <>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Wallet Number:</span>
                    <span className="font-mono font-medium">
                      {transaction.paymentDetails.walletNumber}
                    </span>
                  </div>
                  {transaction.paymentDetails.walletType && (
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Wallet Type:</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {transaction.paymentDetails.walletType}
                      </Badge>
                    </div>
                  )}
                </>
              )}

              {/* Bank Payment Details */}
              {transaction.paymentDetails.bankName && (
                <>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Bank Name:</span>
                    <span className="font-medium flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {transaction.paymentDetails.bankName}
                    </span>
                  </div>
                  {transaction.paymentDetails.accountNumber && (
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Account Number:</span>
                      <span className="font-mono font-medium">
                        {transaction.paymentDetails.accountNumber}
                      </span>
                    </div>
                  )}
                  {transaction.paymentDetails.branch && (
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Branch:</span>
                      <span className="font-medium">{transaction.paymentDetails.branch}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Gateway Info */}
        {transaction.gateway && (
          <div className="text-xs text-muted-foreground">
            Gateway: <span className="font-medium capitalize">{transaction.gateway.type || "Manual"}</span>
          </div>
        )}

        {/* Verification Info */}
        {transaction.verifiedAt && transaction.verifiedBy && (
          <div className="rounded-lg border border-green-200 bg-green-50/50 dark:bg-green-950/20 p-3">
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
              <User className="h-4 w-4" />
              <div>
                <div className="font-medium">Verified</div>
                <div className="text-xs">
                  {format(new Date(transaction.verifiedAt), "MMM dd, yyyy HH:mm")}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {transaction.notes && (
          <div className="rounded-lg border bg-amber-50/50 dark:bg-amber-950/20 p-3">
            <div className="text-xs text-muted-foreground mb-1">Admin Notes:</div>
            <div className="text-sm">{transaction.notes}</div>
          </div>
        )}

        {/* Commission Info */}
        {transaction.commission && transaction.commission.netAmount > 0 && (
          <div className="rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Platform Commission:</span>
              <div>
                <span className="font-semibold">৳{transaction.commission.netAmount.toLocaleString()}</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {transaction.commission.status}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    </DialogWrapper>
  );
}

/**
 * Quick summary of transaction totals
 */
export const TransactionSummary = memo(function TransactionSummary({ transactions = [] }) {
  const summary = useMemo(() => {
    const total = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const verified = transactions.filter((t) => t.status === "verified" || t.status === "completed");
    const pending = transactions.filter((t) => t.status === "pending");
    const failed = transactions.filter((t) => t.status === "failed" || t.status === "cancelled");

    return {
      total,
      count: transactions.length,
      verified: verified.length,
      pending: pending.length,
      failed: failed.length,
      verifiedAmount: verified.reduce((sum, t) => sum + (t.amount || 0), 0),
    };
  }, [transactions]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="rounded-lg border bg-card p-3">
        <div className="text-xs text-muted-foreground">Total</div>
        <div className="text-xl font-bold">{summary.count}</div>
      </div>
      <div className="rounded-lg border bg-card p-3">
        <div className="text-xs text-muted-foreground">Verified</div>
        <div className="text-xl font-bold text-green-600">{summary.verified}</div>
      </div>
      <div className="rounded-lg border bg-card p-3">
        <div className="text-xs text-muted-foreground">Pending</div>
        <div className="text-xl font-bold text-yellow-600">{summary.pending}</div>
      </div>
      <div className="rounded-lg border bg-card p-3">
        <div className="text-xs text-muted-foreground">Amount</div>
        <div className="text-xl font-bold">৳{summary.verifiedAmount.toLocaleString()}</div>
      </div>
    </div>
  );
});
