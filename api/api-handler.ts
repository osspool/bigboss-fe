// @/api/api-handler.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  console.error('NEXT_PUBLIC_API_URL is not defined in environment variables');
}

// ==================== Types ====================

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface ApiRequestOptions {
  body?: unknown;
  token?: string | null;
  organizationId?: string | null;
  revalidate?: number;
  headerOptions?: Record<string, string>;
  tags?: string[];
  cache?: RequestCache;
}

export interface BlobResponse {
  data: Blob;
  response: Response;
}

export interface TextResponse {
  data: string;
  response: Response;
}

// ==================== API Request Handler ====================

/**
 * Universal API request handler for Next.js applications
 * Handles JSON, binary (PDF, images), CSV, and text responses
 *
 * @template T - Expected response type
 * @param method - HTTP method
 * @param endpoint - API endpoint (will be appended to BASE_URL)
 * @param options - Request options
 * @param debug - Enable debug logging
 * @returns Promise resolving to the response data
 *
 * @example
 * // JSON response
 * const { success, data } = await handleApiRequest<ApiResponse<User>>('GET', '/users/me', { token });
 *
 * // Paginated response
 * const response = await handleApiRequest<PaginatedResponse<Product>>('GET', '/products?page=1');
 *
 * // Create with body
 * const result = await handleApiRequest('POST', '/orders', { token, body: orderData });
 */
export async function handleApiRequest<T = unknown>(
  method: HttpMethod,
  endpoint: string,
  options: ApiRequestOptions = {},
  debug = false
): Promise<T> {
  const {
    body,
    token,
    organizationId,
    revalidate,
    headerOptions,
    tags,
    cache,
  } = options;

  try {
    let headers: Record<string, string> = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(organizationId && { 'x-organization-id': organizationId }),
    };

    // Only set 'Content-Type' to json if the body is not a FormData object
    if (!(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (headerOptions) {
      headers = { ...headers, ...headerOptions };
    }

    const fetchOptions: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = {
      method,
      headers,
      credentials: 'include',
    };

    // Add body if present
    if (body !== undefined && body !== null) {
      fetchOptions.body = body instanceof FormData ? body : JSON.stringify(body);
    }

    // Add Next.js specific options
    if (cache) {
      fetchOptions.cache = cache;
    }
    if (revalidate !== undefined) {
      fetchOptions.next = {
        ...fetchOptions.next,
        revalidate,
      };
    }
    if (tags) {
      fetchOptions.next = {
        ...fetchOptions.next,
        tags,
      };
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, fetchOptions);

    if (!response.ok) {
      const res = await response.json().catch(() => null);
      throw new Error(res?.message || response.statusText);
    }

    // Detect response type based on content type header
    const contentType = response.headers.get('Content-Type');

    let data: unknown;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else if (contentType?.includes('application/pdf') || contentType?.includes('image/')) {
      const blobData = await response.blob();
      data = { data: blobData, response };
    } else if (contentType?.includes('text/csv')) {
      const csvData = await response.blob();
      data = { data: csvData, response };
    } else if (contentType?.includes('text/')) {
      const text = await response.text();
      data = { data: text, response };
    } else {
      // For unknown content types, try blob first, fallback to text
      try {
        const blob = await response.clone().blob();
        data = { data: blob, response };
      } catch {
        const text = await response.text();
        data = { data: text, response };
      }
    }

    if (debug) console.log('API Response:', data);

    return data as T;
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error);
    throw new Error(error instanceof Error ? error.message : 'An error occurred while fetching data.');
  }
}



// ==================== Query String Utilities ====================

// ==================== Query String Utilities ====================

/**
 * Creates query string from parameters
 * Supports: ?field=value and arrays as field[in]=value1,value2
 *
 * @example
 * createQueryString({ page: 1, limit: 10, status: 'active' })
 * // => 'page=1&limit=10&status=active'
 *
 * createQueryString({ roles: ['admin', 'user'] })
 * // => 'roles[in]=admin,user'
 */
export function createQueryString<T extends Record<string, unknown>>(params: T = {} as T): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '') return;

    if (Array.isArray(value)) {
      if (value.length > 1) {
        searchParams.append(`${key}[in]`, value.join(','));
      } else if (value.length === 1) {
        searchParams.append(key, String(value[0]));
      }
    } else if (value === null) {
      searchParams.append(key, 'null');
    } else {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}



export { BASE_URL };
