// @/hooks/payment/usePaymentVerification.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { paymentApi } from '@/api/platform/payment-api';

/**
 * Hook for manual payment verification
 * Used by admins to verify bKash, Nagad, bank transfers, cash, etc.
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
    onSuccess: () => {
      toast.success('Payment verified successfully');

      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to verify payment');
    },
  });

  return {
    verifyPayment: verifyMutation.mutateAsync,
    isVerifying: verifyMutation.isPending,
  };
}

/**
 * Hook for manual payment rejection
 * Used by admins to reject invalid/fraudulent payments
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
    onSuccess: () => {
      toast.success('Payment rejected');

      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reject payment');
    },
  });

  return {
    rejectPayment: rejectMutation.mutateAsync,
    isRejecting: rejectMutation.isPending,
  };
}

