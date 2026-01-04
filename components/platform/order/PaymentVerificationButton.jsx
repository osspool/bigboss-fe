"use client";

import { useState, useCallback } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { usePaymentActions } from "@/hooks/query";

/**
 * PaymentVerificationButton - Admin payment verification for pending transactions
 * Allows admin to verify or reject manual payments (bKash, Nagad, bank transfer, cash)
 */
export function PaymentVerificationButton({
  transaction,
  token,
  onSuccess,
  entityType = "Order",
}) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { verifyPayment, isVerifying, rejectPayment, isRejecting } = usePaymentActions(token);

  const transactionId = transaction?.transactionId || transaction?._id;

  if (!transactionId || transaction?.status !== "pending") {
    return null;
  }

  const handleVerify = useCallback(async () => {
    if (!window.confirm("Verify this payment? This will update the order status to confirmed.")) {
      return;
    }

    try {
      await verifyPayment({
        transactionId,
        notes: `Verified by admin for ${entityType}`,
      });

      onSuccess?.();
    } catch (error) {
      console.error("Payment verification failed:", error);
    }
  }, [transactionId, entityType, verifyPayment, onSuccess]);

  const handleReject = useCallback(async () => {
    if (!rejectReason.trim()) {
      return;
    }

    try {
      await rejectPayment({
        transactionId,
        reason: rejectReason,
      });

      setShowRejectDialog(false);
      setRejectReason("");
      onSuccess?.();
    } catch (error) {
      console.error("Payment rejection failed:", error);
    }
  }, [transactionId, rejectReason, rejectPayment, onSuccess]);

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-warning/10 border-2 border-warning/40 rounded-lg">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-warning">Payment Verification Required</h4>
          <p className="text-xs text-muted-foreground mt-1">
            This payment is pending verification. Review and take action.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowRejectDialog(true)}
            disabled={isVerifying || isRejecting}
            className="gap-2"
          >
            {isRejecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            Reject
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={handleVerify}
            disabled={isVerifying || isRejecting}
            className="gap-2 bg-success hover:bg-success/90"
          >
            {isVerifying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Verify Payment
          </Button>
        </div>
      </div>

      {/* Reject Payment Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this payment. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Rejection Reason</Label>
              <Textarea
                id="reject-reason"
                placeholder="e.g., Invalid transaction ID, insufficient amount, payment not received..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-sm text-muted-foreground">
                <strong>Warning:</strong> Rejecting this payment will mark the transaction as failed
                and the order payment status will be updated accordingly.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason("");
              }}
              disabled={isRejecting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isRejecting || !rejectReason.trim()}
            >
              {isRejecting ? "Rejecting..." : "Reject Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
