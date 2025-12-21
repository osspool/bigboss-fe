// @/api/platform/finance-api.ts
import { handleApiRequest } from "../api-handler";
import type { ApiResponse, RequestOptions } from "../api-factory";
import type {
  FinanceStatement,
  FinanceStatementParams,
  FinanceSummary,
  FinanceSummaryParams,
} from "@/types/finance.types";

type FetchOptions = Omit<RequestOptions, "token" | "organizationId">;

/**
 * Finance API - Statements and summaries for backoffice
 *
 * Endpoints:
 * - getStatements({ token, params }) - Export statements (CSV/JSON)
 * - getSummary({ token, params }) - Get summary with breakdowns
 *
 * Roles:
 * - admin, superadmin, finance-admin, finance-manager
 */
class FinanceApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = "/api/v1/finance";
  }

  /**
   * Get finance statements (export)
   * GET /finance/statements
   *
   * Query params:
   * - startDate, endDate (ISO datetime) - required
   * - branchId (optional)
   * - source = web|pos|api (optional)
   * - status (optional)
   * - format = csv|json (default: csv)
   * - page, limit (for JSON pagination)
   */
  async getStatements({
    token,
    params,
    options = {},
  }: {
    token: string;
    params: FinanceStatementParams;
    options?: FetchOptions;
  }): Promise<ApiResponse<FinanceStatement[]>> {
    if (!token) {
      throw new Error("Authentication required");
    }

    const queryParams = new URLSearchParams();

    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    if (params.branchId) queryParams.append("branchId", params.branchId);
    if (params.source) queryParams.append("source", params.source);
    if (params.status) queryParams.append("status", params.status);
    if (params.format) queryParams.append("format", params.format);
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const url = `${this.baseUrl}/statements${queryParams.toString() ? `?${queryParams}` : ""}`;

    return handleApiRequest("GET", url, {
      token,
      ...options,
    });
  }

  /**
   * Get finance summary (dashboard)
   * GET /finance/summary
   *
   * Query params:
   * - startDate, endDate (ISO datetime) - required
   * - branchId (optional)
   * - source = web|pos|api (optional)
   * - status (optional)
   *
   * Response:
   * - data.totals: overall income/expense/net/count
   * - data.byMethod: breakdown by payment method
   * - data.byDay: per-day breakdown by branch
   */
  async getSummary({
    token,
    params,
    options = {},
  }: {
    token: string;
    params: FinanceSummaryParams;
    options?: FetchOptions;
  }): Promise<ApiResponse<FinanceSummary>> {
    if (!token) {
      throw new Error("Authentication required");
    }

    const queryParams = new URLSearchParams();

    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    if (params.branchId) queryParams.append("branchId", params.branchId);
    if (params.source) queryParams.append("source", params.source);
    if (params.status) queryParams.append("status", params.status);

    const url = `${this.baseUrl}/summary${queryParams.toString() ? `?${queryParams}` : ""}`;

    return handleApiRequest("GET", url, {
      token,
      ...options,
    });
  }
}

export const financeApi = new FinanceApi();
export { FinanceApi };
