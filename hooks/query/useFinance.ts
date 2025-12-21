// hooks/query/useFinance.ts
import { useQuery } from "@tanstack/react-query";
import { financeApi } from "@/api/platform/finance-api";
import type {
  FinanceStatementParams,
  FinanceSummaryParams,
} from "@/types/finance.types";

/**
 * Finance Query Keys
 */
export const FINANCE_KEYS = {
  all: ["finance"] as const,
  statements: () => [...FINANCE_KEYS.all, "statements"] as const,
  statementList: (params: FinanceStatementParams) =>
    [...FINANCE_KEYS.statements(), params] as const,
  summary: () => [...FINANCE_KEYS.all, "summary"] as const,
  summaryData: (params: FinanceSummaryParams) =>
    [...FINANCE_KEYS.summary(), params] as const,
};

/**
 * Hook to get finance statements
 * @param token - Auth token
 * @param params - Query parameters
 * @param options - React Query options
 */
export function useFinanceStatements(
  token: string,
  params: FinanceStatementParams,
  options = {}
) {
  return useQuery({
    queryKey: FINANCE_KEYS.statementList(params),
    queryFn: () => financeApi.getStatements({ token, params }),
    enabled: !!token && !!params.startDate && !!params.endDate,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook to get finance summary
 * @param token - Auth token
 * @param params - Query parameters
 * @param options - React Query options
 */
export function useFinanceSummary(
  token: string,
  params: FinanceSummaryParams,
  options = {}
) {
  return useQuery({
    queryKey: FINANCE_KEYS.summaryData(params),
    queryFn: () => financeApi.getSummary({ token, params }),
    enabled: !!token && !!params.startDate && !!params.endDate,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}
