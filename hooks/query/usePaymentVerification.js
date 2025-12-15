"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { paymentApi } from '@/api/platform/payment-api';

/**
 * Hook for manual payment verification
 * Used by admins to verify bKash, Nagad, bank transfers, cash, etc.
 *
 * After verification:
 * - Transaction status → 'verified'
 * - Order payment status → 'verified'
 * - Order status → 'confirmed' (if was 'pending')
 *
 * Usage:
 * const { verifyPayment, isVerifying } = useVerifyPayment(token);
 * await verifyPayment({ transactionId, notes });
 */
export function useVerifyPayment(token) {
  const queryClient = useQueryClient();

  const verifyMutation = useMutation({
    mutationFn: async ({ transactionId, notes }) => {
      return paymentApi.verifyPayment({
        token,
        data: { transactionId, notes },
      });
    },
    onSuccess: async (result) => {
      toast.success('Payment verified successfully');

      // Invalidate all order and transaction queries to refresh UI
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
      ]);

      return result;
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to verify payment');
    },
  });

  return {
    verifyPayment: verifyMutation.mutateAsync,
    isVerifying: verifyMutation.isPending,
    verifyResult: verifyMutation.data,
  };
}

/**
 * Hook for manual payment rejection
 * Used by admins to reject invalid/fraudulent payments
 *
 * After rejection:
 * - Transaction status → 'failed'
 * - Order payment status → 'failed'
 * - Failure reason recorded
 *
 * Usage:
 * const { rejectPayment, isRejecting } = useRejectPayment(token);
 * await rejectPayment({ transactionId, reason });
 */
export function useRejectPayment(token) {
  const queryClient = useQueryClient();

  const rejectMutation = useMutation({
    mutationFn: async ({ transactionId, reason }) => {
      return paymentApi.rejectPayment({
        token,
        data: { transactionId, reason },
      });
    },
    onSuccess: async (result) => {
      toast.success('Payment rejected');

      // Invalidate all order and transaction queries to refresh UI
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
      ]);

      return result;
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reject payment');
    },
  });

  return {
    rejectPayment: rejectMutation.mutateAsync,
    isRejecting: rejectMutation.isPending,
    rejectResult: rejectMutation.data,
  };
}
