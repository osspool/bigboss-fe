
import { createCrudHooks } from '@/hooks/factories';
import { useQuery } from '@tanstack/react-query';
import { couponApi } from '@/api/platform/coupon-api';

// Create standard CRUD hooks
const { KEYS, useList, useDetail, useActions, useNavigation } = createCrudHooks({
  api: couponApi,
  entityKey: 'coupons',
  singular: 'Coupon',
  plural: 'Coupons',
  defaults: {
    staleTime: 5 * 60 * 1000, // 5 minutes (coupons change less frequently)
    messages: {
      createSuccess: "Coupon created successfully",
      updateSuccess: "Coupon updated successfully",
      deleteSuccess: "Coupon deleted successfully",
    },
  },
});

/**
 * Hook to validate coupon
 * @param {string} token - Auth token
 * @param {object} options - React Query options
 * @returns {object} Query result with coupon data
 */
export function useValidateCoupon(token, code, options = {}) {
  return useQuery({
    queryKey: ['coupon', 'validate', code],
    queryFn: () => couponApi.validateCoupon({ code, token }),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Export standard hooks
export {
  KEYS as COUPON_KEYS,
  useList as useCoupons,
  useDetail as useCouponDetail,
  useActions as useCouponActions,
  useNavigation as useCouponNavigation,
};
