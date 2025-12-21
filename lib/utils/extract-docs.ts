export function extractDocs<T>(res: unknown): T[] {
  const anyRes = res as any;
  if (Array.isArray(anyRes?.docs)) return anyRes.docs as T[];
  if (Array.isArray(anyRes?.data?.docs)) return anyRes.data.docs as T[];
  if (Array.isArray(anyRes?.data)) return anyRes.data as T[];
  if (Array.isArray(anyRes)) return anyRes as T[];
  return [];
}

