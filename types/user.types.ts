// types/user.types.ts

/**
 * User Types for Admin Management
 *
 * Simple types for CRUD operations on users.
 * Frontend uses standard BaseApi methods with these types.
 */

// ============================================
// ROLE TYPES
// ============================================

/** System-level roles (global permissions) */
export type UserRoleType =
  | 'user'
  | 'admin'
  | 'superadmin'
  | 'finance-admin'
  | 'finance-manager'
  | 'store-manager'
  | 'warehouse-staff';

/** Branch-specific roles */
export type BranchRoleType =
  | 'branch_manager'
  | 'inventory_staff'
  | 'cashier'
  | 'stock_receiver'
  | 'stock_requester'
  | 'viewer';

// ============================================
// USER TYPES
// ============================================

/** User's branch assignment */
export interface UserBranchAssignment {
  branchId: string;
  branchCode?: string;
  branchName?: string;
  branchRole?: 'head_office' | 'sub_branch';
  roles: BranchRoleType[];
  isPrimary: boolean;
}

/** User document */
export interface User {
  _id: string;
  name: string;
  email: string;
  roles: UserRoleType[];
  branches: UserBranchAssignment[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** Create user payload */
export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  roles?: UserRoleType[];
  branches?: Array<{
    branchId: string;
    roles?: BranchRoleType[];
    isPrimary?: boolean;
  }>;
}

/** Update user payload - just patch what you need */
export interface UpdateUserPayload {
  name?: string;
  email?: string;
  roles?: UserRoleType[];
  branches?: Array<{
    branchId: string;
    roles?: BranchRoleType[];
    isPrimary?: boolean;
  }>;
  isActive?: boolean;
}

/** Query params for listing users */
export interface UserListParams {
  page?: number;
  limit?: number;
  sort?: string;
  name?: string;
  'name[contains]'?: string;
  email?: string;
  roles?: UserRoleType;
  'roles[in]'?: string;
  'branches.branchId'?: string;
  'branches.roles'?: BranchRoleType;
  isActive?: boolean;
}
