// @/api/api-factory.ts
import { handleApiRequest } from "./api-handler";

// ==================== MongoKit Response Types ====================

/**
 * Base API response wrapper
 * All endpoints return { success: boolean, ... }
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * Offset pagination response (page-based)
 * Used when: ?page=1&limit=10
 */
export interface OffsetPaginationResponse<T = unknown> {
  success: boolean;
  method: 'offset';
  docs: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
  warning?: string;
}

/**
 * Keyset pagination response (cursor-based)
 * Used when: ?after=cursor&limit=10
 */
export interface KeysetPaginationResponse<T = unknown> {
  success: boolean;
  method: 'keyset';
  docs: T[];
  limit: number;
  hasMore: boolean;
  next: string | null;
}

/**
 * Aggregate pagination response
 * Used for complex aggregation queries
 */
export interface AggregatePaginationResponse<T = unknown> {
  success: boolean;
  method: 'aggregate';
  docs: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
  warning?: string;
}

/**
 * Union type for all paginated responses
 */
export type PaginatedResponse<T = unknown> =
  | OffsetPaginationResponse<T>
  | KeysetPaginationResponse<T>
  | AggregatePaginationResponse<T>;

/**
 * Delete operation response
 */
export interface DeleteResponse {
  success: boolean;
  message: string;
  count?: number;
}

// ==================== Request Types ====================

/**
 * Sort direction
 */
export type SortDirection = 1 | -1 | 'asc' | 'desc';

/**
 * Sort specification
 */
export type SortSpec = Record<string, SortDirection> | string;

/**
 * Filter operators supported by MongoKit query parser
 * Usage: ?field[operator]=value
 */
export type FilterOperator =
  | 'eq'      // Equal
  | 'ne'      // Not equal
  | 'gt'      // Greater than
  | 'gte'     // Greater than or equal
  | 'lt'      // Less than
  | 'lte'     // Less than or equal
  | 'in'      // In array
  | 'nin'     // Not in array
  | 'contains'    // String contains (case-insensitive)
  | 'startsWith'  // String starts with
  | 'endsWith'    // String ends with
  | 'regex';      // Regex pattern

/**
 * Query parameters for list/search operations
 */
export interface QueryParams {
  // Pagination
  page?: number;
  limit?: number;
  after?: string; // Cursor for keyset pagination

  // Sorting
  sort?: SortSpec;

  // Filtering - direct equality or bracket operators
  [key: string]: unknown;
}

/**
 * Request options
 */
export interface RequestOptions {
  token?: string | null;
  organizationId?: string | null;
  cache?: RequestCache;
  revalidate?: number;
  tags?: string[];
  headerOptions?: Record<string, string>;
}

// ==================== Base API Configuration ====================

export interface BaseApiConfig {
  basePath?: string;
  defaultParams?: {
    limit?: number;
    page?: number;
    [key: string]: unknown;
  };
  cache?: RequestCache;
  headers?: Record<string, string>;
}

// ==================== Base API Class ====================

/**
 * Base API class that provides standardized CRUD operations
 * Supports direct field queries and bracket syntax: field[operator]=value
 *
 * @template TDoc - Document type returned by the API
 * @template TCreate - Type for create payload (defaults to Partial<TDoc>)
 * @template TUpdate - Type for update payload (defaults to Partial<TDoc>)
 */
export class BaseApi<
  TDoc = Record<string, unknown>,
  TCreate = Partial<TDoc>,
  TUpdate = Partial<TDoc>
> {
  readonly entity: string;
  readonly config: Required<BaseApiConfig>;
  readonly baseUrl: string;

  constructor(entity: string, config: BaseApiConfig = {}) {
    this.entity = entity;
    this.config = {
      basePath: config.basePath ?? '/api/v1',
      defaultParams: {
        limit: 10,
        page: 1,
        ...(config.defaultParams || {}),
      },
      cache: config.cache ?? 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...(config.headers || {}),
      },
    };

    this.baseUrl = `${this.config.basePath}/${this.entity}`;
  }

  /**
   * Creates query string from parameters
   * Supports: ?field=value and ?field[operator]=value
   * Note: null is considered a valid filter value (e.g., organizationId=null)
   */
  createQueryString(params: Record<string, unknown> = {}): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      // Only filter out undefined and empty strings, allow null
      if (value === undefined || value === '') return;

      // Handle arrays - use [in] for multiple values, direct for single
      if (Array.isArray(value)) {
        if (value.length > 1) {
          searchParams.append(`${key}[in]`, value.join(','));
        } else if (value.length === 1) {
          searchParams.append(key, String(value[0]));
        }
      }
      // Handle null explicitly
      else if (value === null) {
        searchParams.append(key, 'null');
      }
      // Handle primitive values directly
      else {
        searchParams.append(key, String(value));
      }
    });

    return searchParams.toString();
  }

  /**
   * Prepares parameters for API request
   * Handles pagination, sorting, and filters
   * Note: Critical security filters (organizationId, ownerId) are ALWAYS sent, even if null
   */
  prepareParams(params: Record<string, unknown> = {}): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    // Critical security filters that MUST always be sent to backend
    const CRITICAL_FILTERS = ['organizationId', 'ownerId'];

    Object.entries(params).forEach(([key, value]) => {
      // Critical filters: convert falsy values to null and always include
      if (CRITICAL_FILTERS.includes(key)) {
        // Convert empty string, undefined, or any falsy value (except 0 and false) to null
        result[key] = value || null;
        return;
      }

      // For all other params: filter out undefined and empty strings
      if (value !== undefined && value !== '') {
        // Handle pagination
        if (['page', 'limit'].includes(key)) {
          result[key] = parseInt(String(value)) || (key === 'page' ? 1 : 10);
        }
        // Handle arrays with bracket syntax
        else if (Array.isArray(value)) {
          if (value.length > 1) {
            result[`${key}[in]`] = value.join(',');
          } else if (value.length === 1) {
            result[key] = value[0];
          }
        }
        // Pass through null and all other parameters as-is
        else {
          result[key] = value;
        }
      }
    });

    return result;
  }

  /**
   * Get all records with pagination and filtering
   * Returns offset or keyset pagination based on params
   */
  async getAll({
    token = null,
    organizationId = null,
    params = {},
    options = {},
  }: {
    token?: string | null;
    organizationId?: string | null;
    params?: Record<string, unknown>;
    options?: Omit<RequestOptions, 'token' | 'organizationId'>;
  } = {}): Promise<PaginatedResponse<TDoc>> {
    const processedParams = this.prepareParams(params);
    const queryString = this.createQueryString(processedParams);

    const requestOptions: RequestOptions = {
      cache: this.config.cache,
      ...options,
    };

    if (token) requestOptions.token = token;
    if (organizationId) requestOptions.organizationId = organizationId;

    return handleApiRequest('GET', `${this.baseUrl}?${queryString}`, requestOptions);
  }

  /**
   * Get a single record by ID
   */
  async getById({
    token = null,
    organizationId = null,
    id,
    params = {},
    options = {},
  }: {
    token?: string | null;
    organizationId?: string | null;
    id: string;
    params?: { select?: string; populate?: string | string[] };
    options?: Omit<RequestOptions, 'token' | 'organizationId'>;
  }): Promise<ApiResponse<TDoc>> {
    if (!id) throw new Error('ID is required');

    const queryString = this.createQueryString(params);
    const url = queryString ? `${this.baseUrl}/${id}?${queryString}` : `${this.baseUrl}/${id}`;

    const requestOptions: RequestOptions = {
      cache: this.config.cache,
      ...options,
    };

    if (token) requestOptions.token = token;
    if (organizationId) requestOptions.organizationId = organizationId;

    return handleApiRequest('GET', url, requestOptions);
  }

  /**
   * Create a new record
   */
  async create({
    token,
    organizationId = null,
    data,
    options = {},
  }: {
    token: string;
    organizationId?: string | null;
    data: TCreate;
    options?: Omit<RequestOptions, 'token' | 'organizationId'>;
  }): Promise<ApiResponse<TDoc>> {
    return handleApiRequest('POST', this.baseUrl, {
      token,
      organizationId,
      body: data,
      ...options,
    });
  }

  /**
   * Update an existing record
   */
  async update({
    token,
    organizationId = null,
    id,
    data,
    options = {},
  }: {
    token: string;
    organizationId?: string | null;
    id: string;
    data: TUpdate;
    options?: Omit<RequestOptions, 'token' | 'organizationId'>;
  }): Promise<ApiResponse<TDoc>> {
    if (!id) throw new Error('ID is required');

    return handleApiRequest('PATCH', `${this.baseUrl}/${id}`, {
      token,
      organizationId,
      body: data,
      ...options,
    });
  }

  /**
   * Delete a record
   */
  async delete({
    token,
    organizationId = null,
    id,
    options = {},
  }: {
    token: string;
    organizationId?: string | null;
    id: string;
    options?: Omit<RequestOptions, 'token' | 'organizationId'>;
  }): Promise<DeleteResponse> {
    if (!id) throw new Error('ID is required');

    return handleApiRequest('DELETE', `${this.baseUrl}/${id}`, {
      token,
      organizationId,
      ...options,
    });
  }

  /**
   * Search with custom parameters
   * @example
   * search({ searchParams: { 'brand[contains]': 'nike' } })
   * search({ searchParams: { upc: '123456789' } })
   */
  async search({
    token = null,
    organizationId = null,
    searchParams = {},
    params = {},
    options = {},
  }: {
    token?: string | null;
    organizationId?: string | null;
    searchParams?: Record<string, unknown>;
    params?: QueryParams;
    options?: Omit<RequestOptions, 'token' | 'organizationId'>;
  } = {}): Promise<PaginatedResponse<TDoc>> {
    const queryParams = { ...params, ...searchParams };
    const processedParams = this.prepareParams(queryParams);
    const queryString = this.createQueryString(processedParams);

    const requestOptions: RequestOptions = {
      cache: this.config.cache,
      ...options,
    };

    if (token) requestOptions.token = token;
    if (organizationId) requestOptions.organizationId = organizationId;

    return handleApiRequest('GET', `${this.baseUrl}?${queryString}`, requestOptions);
  }

  /**
   * Find records by field with optional operator
   * @example
   * findBy({ field: 'brand', value: 'nike', operator: 'contains' })
   * findBy({ field: 'status', value: ['active', 'pending'], operator: 'in' })
   */
  async findBy({
    token = null,
    organizationId = null,
    field,
    value,
    operator,
    params = {},
    options = {},
  }: {
    token?: string | null;
    organizationId?: string | null;
    field: string;
    value: unknown;
    operator?: FilterOperator;
    params?: QueryParams;
    options?: Omit<RequestOptions, 'token' | 'organizationId'>;
  }): Promise<PaginatedResponse<TDoc>> {
    if (!field || value === undefined) {
      throw new Error('Field and value are required');
    }

    const queryParams: QueryParams = { ...params };

    if (operator) {
      queryParams[`${field}[${operator}]`] = Array.isArray(value) ? value.join(',') : value;
    } else {
      queryParams[field] = value;
    }

    const processedParams = this.prepareParams(queryParams);
    const queryString = this.createQueryString(processedParams);

    const requestOptions: RequestOptions = {
      cache: this.config.cache,
      ...options,
    };

    if (token) requestOptions.token = token;
    if (organizationId) requestOptions.organizationId = organizationId;

    return handleApiRequest('GET', `${this.baseUrl}?${queryString}`, requestOptions);
  }

  /**
   * Make a custom API request to a sub-endpoint
   * @example
   * request('POST', `${this.baseUrl}/${id}/action`, { token, data: { ... } })
   */
  async request<TResponse = unknown>(
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    endpoint: string,
    {
      token,
      organizationId = null,
      data,
      params,
      options = {},
    }: {
      token?: string;
      organizationId?: string | null;
      data?: Record<string, unknown>;
      params?: QueryParams;
      options?: Omit<RequestOptions, 'token' | 'organizationId'>;
    } = {}
  ): Promise<TResponse> {
    let url = endpoint;

    if (params) {
      const processedParams = this.prepareParams(params);
      const queryString = this.createQueryString(processedParams);
      url = `${endpoint}?${queryString}`;
    }

    return handleApiRequest(method, url, {
      token,
      organizationId,
      body: data,
      cache: this.config.cache,
      ...options,
    });
  }
}

// ==================== Factory Function ====================

/**
 * Factory function to create a typed BaseApi instance
 *
 * @template TDoc - Document type returned by the API
 * @template TCreate - Type for create payload
 * @template TUpdate - Type for update payload
 *
 * @example
 * // Simple usage
 * const productApi = createCrudApi('products');
 *
 * // With types
 * interface Product { _id: string; name: string; price: number; }
 * interface CreateProduct { name: string; price: number; }
 * const productApi = createCrudApi<Product, CreateProduct>('products');
 *
 * // With custom config
 * const productApi = createCrudApi('products', { basePath: '/api/v2' });
 */
export function createCrudApi<
  TDoc = Record<string, unknown>,
  TCreate = Partial<TDoc>,
  TUpdate = Partial<TDoc>
>(entity: string, config: BaseApiConfig = {}): BaseApi<TDoc, TCreate, TUpdate> {
  return new BaseApi<TDoc, TCreate, TUpdate>(entity, config);
}

// ==================== Type Helpers ====================

/**
 * Extract document type from paginated response
 */
export type ExtractDoc<T> = T extends PaginatedResponse<infer D> ? D : never;

/**
 * Helper to check if response is offset pagination
 */
export function isOffsetPagination<T>(
  response: PaginatedResponse<T>
): response is OffsetPaginationResponse<T> {
  return response.method === 'offset';
}

/**
 * Helper to check if response is keyset pagination
 */
export function isKeysetPagination<T>(
  response: PaginatedResponse<T>
): response is KeysetPaginationResponse<T> {
  return response.method === 'keyset';
}

/**
 * Helper to check if response is aggregate pagination
 */
export function isAggregatePagination<T>(
  response: PaginatedResponse<T>
): response is AggregatePaginationResponse<T> {
  return response.method === 'aggregate';
}
