// @/api/platform/user-api.ts
import { BaseApi } from '../api-factory';
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
} from '@/types/user.types';

/**
 * User API - Admin User Management (CRUD)
 *
 * Standard CRUD (inherited from BaseApi):
 * - getAll({ token, params }) - list users with filtering/pagination
 * - getById({ token, id }) - get user by ID
 * - create({ token, data }) - create user (admin only)
 * - update({ token, id, data }) - update user (admin only)
 * - delete({ token, id }) - delete user (admin only)
 *
 * Query examples:
 * - List all users: getAll({ token, params: { page: 1, limit: 10 } })
 * - Filter by role: getAll({ token, params: { roles: 'admin' } })
 * - Search by name: getAll({ token, params: { 'name[contains]': 'john' } })
 * - Filter by branch: getAll({ token, params: { 'branches.branchId': 'branch_123' } })
 * - Active users only: getAll({ token, params: { isActive: true } })
 */
class UserApi extends BaseApi<User, CreateUserPayload, UpdateUserPayload> {
  constructor(config = {}) {
    super('users', config);
  }
}

// Create and export a singleton instance
export const userApi = new UserApi();
export { UserApi };
