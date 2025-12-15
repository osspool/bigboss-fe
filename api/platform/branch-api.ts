// @/api/platform/branch-api.ts
import { BaseApi, type ApiResponse, type RequestOptions } from '../api-factory';
import { handleApiRequest } from '../api-handler';
import type {
  Branch,
  CreateBranchPayload,
  UpdateBranchPayload,
} from '@/types/inventory.types';

type FetchOptions = Omit<RequestOptions, 'token' | 'organizationId'>;

/**
 * Branch API - CRUD + Custom Endpoints
 *
 * Standard CRUD (inherited from BaseApi):
 * - getAll({ token, params }) - list with filtering/pagination
 * - getById({ token, id }) - get by ID
 * - create({ token, data }) - create (admin only)
 * - update({ token, id, data }) - update (admin only)
 * - delete({ token, id }) - delete (admin only)
 *
 * Custom endpoints:
 * - getByCode({ token, code }) - GET /branches/code/:code
 * - getDefault({ token }) - GET /branches/default
 * - getActive({ token }) - GET /branches/active
 * - setDefault({ token, id }) - POST /branches/:id/set-default
 */
class BranchApi extends BaseApi<Branch, CreateBranchPayload, UpdateBranchPayload> {
  constructor(config = {}) {
    super('branches', config);
  }

  /**
   * Get branch by code
   * GET /branches/code/:code
   *
   * @example
   * branchApi.getByCode({ token, code: 'DHK-1' })
   */
  async getByCode({
    token,
    code,
    options = {},
  }: {
    token: string;
    code: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<Branch>> {
    if (!code) {
      throw new Error('Branch code is required');
    }

    return handleApiRequest('GET', `${this.baseUrl}/code/${code}`, {
      token,
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Get default branch (auto-creates if none exists)
   * GET /branches/default
   *
   * @example
   * branchApi.getDefault({ token })
   */
  async getDefault({
    token,
    options = {},
  }: {
    token: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<Branch>> {
    return handleApiRequest('GET', `${this.baseUrl}/default`, {
      token,
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Get all active branches (simple list, no pagination)
   * GET /branches/active
   *
   * @example
   * branchApi.getActive({ token })
   */
  async getActive({
    token,
    options = {},
  }: {
    token: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<Branch[]>> {
    return handleApiRequest('GET', `${this.baseUrl}/active`, {
      token,
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Set a branch as the default
   * POST /branches/:id/set-default
   *
   * @example
   * branchApi.setDefault({ token, id: '507f1f77bcf86cd799439011' })
   */
  async setDefault({
    token,
    id,
    options = {},
  }: {
    token: string;
    id: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<Branch>> {
    if (!id) {
      throw new Error('Branch ID is required');
    }

    return handleApiRequest('POST', `${this.baseUrl}/${id}/set-default`, {
      token,
      ...options,
    });
  }
}

// Create and export a singleton instance
export const branchApi = new BranchApi();
export { BranchApi };
