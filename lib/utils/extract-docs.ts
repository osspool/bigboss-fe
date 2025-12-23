export function extractDocs<T>(res: unknown): T[] {
  const anyRes = res as any;
  if (Array.isArray(anyRes?.docs)) return anyRes.docs as T[];
  if (Array.isArray(anyRes?.data?.docs)) return anyRes.data.docs as T[];
  if (Array.isArray(anyRes?.data)) return anyRes.data as T[];
  if (Array.isArray(anyRes)) return anyRes as T[];
  return [];
}

export interface Pagination {
  total: number;
  pages: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function extractPagination(res: unknown): Pagination | null {
  const anyRes = res as any;
  if (anyRes?.total !== undefined && anyRes?.page !== undefined) {
    return {
      total: anyRes.total ?? 0,
      pages: anyRes.pages ?? 1,
      page: anyRes.page ?? 1,
      limit: anyRes.limit ?? 10,
      hasNext: anyRes.hasNext ?? false,
      hasPrev: anyRes.hasPrev ?? false,
    };
  }
  return null;
}

