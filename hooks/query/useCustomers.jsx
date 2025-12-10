import { customerApi } from '@/api/platform/customer-api';
import { createCrudHooks } from '@/hooks/factories';
import { useQuery } from '@tanstack/react-query';

// Create standard CRUD hooks
const { KEYS, useList, useDetail, useActions, useNavigation } = createCrudHooks({
  api: customerApi,
  entityKey: 'customers',
  singular: 'Customer',
  plural: 'Customers',
  defaults: {
    staleTime: 5 * 60 * 1000, // 5 minutes (customers change less frequently)
    messages: {
      createSuccess: "Customer created successfully",
      updateSuccess: "Customer updated successfully",
      deleteSuccess: "Customer deleted successfully",
    },
  },
});

/**
 * Hook to get current user's customer profile
 * @param {string} token - Auth token
 * @param {object} options - React Query options
 * @returns {object} Query result with customer data
 */
export function useCurrentCustomer(token, options = {}) {
  return useQuery({
    queryKey: [...KEYS.all, 'me'],
    queryFn: () => customerApi.getMe({ token }),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Export standard hooks
export {
  KEYS as CUSTOMER_KEYS,
  useList as useCustomers,
  useDetail as useCustomerDetail,
  useActions as useCustomerActions,
  useNavigation as useCustomerNavigation,
};
