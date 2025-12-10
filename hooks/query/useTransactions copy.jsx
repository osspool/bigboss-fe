import { transactionApi } from '@/api/platform/transaction-api';
import { createCrudHooks } from '@/hooks/factories';

// Create standard CRUD hooks
const { KEYS, useList, useDetail, useActions, useNavigation } = createCrudHooks({
  api: transactionApi,
  entityKey: 'transactions',
  singular: 'Transaction',
  plural: 'Transactions',
  defaults: {
    staleTime: 1 * 60 * 1000, // 1 minute (transactions change frequently)
    messages: {
      createSuccess: "Transaction created successfully",
      updateSuccess: "Transaction updated successfully",
      deleteSuccess: "Transaction deleted successfully",
    },
  },
});

/**
 * Query transactions by reference (Order/Enrollment/Subscription)
 * Uses base getAll with params
 */
function useTransactionsByReference({ token, referenceModel, referenceId, options = {} }) {
  const { items: transactions = [], pagination, isLoading, error, refetch } = useList(
    token,
    { referenceModel, referenceId },
    options
  );

  return { transactions, pagination, isLoading, error, refetch };
}

// Export standard hooks
export {
  KEYS as TRANSACTION_KEYS,
  useList as useTransactions,
  useDetail as useTransactionDetail,
  useActions as useTransactionActions,
  useNavigation as useTransactionNavigation,
  useTransactionsByReference,
};



