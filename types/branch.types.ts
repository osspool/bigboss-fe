/**
 * Branch Types
 *
 * Type definitions for store/warehouse locations.
 * Separated from inventory types for better organization and single responsibility.
 */

// ============================================
// BRANCH TYPES
// ============================================

export type BranchType = 'store' | 'warehouse' | 'outlet' | 'franchise';

/**
 * Branch Hierarchy Role
 * Determines the branch's position in the inventory flow hierarchy.
 *
 * - head_office: Central warehouse/HQ that receives purchases and distributes to sub-branches
 * - sub_branch: Store/outlet that receives stock from head office
 */
export type BranchRole = 'head_office' | 'sub_branch';

export interface BranchAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

/**
 * Branch (Store/Warehouse Location)
 *
 * Represents a physical location for inventory tracking and POS operations.
 * Every deployment must have at least one branch (default branch).
 *
 * Branch Hierarchy:
 * - One branch must be designated as head_office (typically the default branch)
 * - All other branches are sub_branch by default
 * - Stock flows: Suppliers -> Head Office -> Sub-branches
 */
export interface Branch {
  _id: string;
  /** URL-friendly slug (auto-generated from name) */
  slug: string;
  /** Unique branch code (e.g., "DHK-1", "CTG-MAIN") - uppercase, stable */
  code: string;
  /** Display name */
  name: string;
  /** Branch type (store, warehouse, outlet, franchise) */
  type: BranchType;
  /**
   * Branch role in inventory hierarchy
   * - head_office: Receives purchases, distributes to sub-branches
   * - sub_branch: Receives stock from head office only
   */
  role: BranchRole;
  /** Physical address */
  address?: BranchAddress;
  /** Contact phone */
  phone?: string;
  /** Contact email */
  email?: string;
  /** Operating hours (simple format, e.g., "10:00 AM - 10:00 PM") */
  operatingHours?: string;
  /** Whether this is the default branch (only one can be default) */
  isDefault: boolean;
  /** Whether this branch is active */
  isActive: boolean;
  /** Manager user ID reference */
  manager?: string;
  /** Admin notes (admin-only field) */
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Branch Payload
 */
export interface CreateBranchPayload {
  code: string;
  name: string;
  type?: BranchType;
  /** Branch hierarchy role (defaults to 'sub_branch') */
  role?: BranchRole;
  address?: BranchAddress;
  phone?: string;
  email?: string;
  operatingHours?: string;
  isDefault?: boolean;
}

/**
 * Update Branch Payload
 */
export interface UpdateBranchPayload extends Partial<CreateBranchPayload> {
  isActive?: boolean;
  notes?: string;
}

/**
 * Branch Summary (for dropdowns, lists)
 */
export interface BranchSummary {
  _id: string;
  code: string;
  name: string;
  role: BranchRole;
  isDefault: boolean;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if branch is head office
 */
export function isHeadOffice(branch: Branch | BranchSummary): boolean {
  return branch.role === 'head_office';
}

/**
 * Check if branch is sub-branch
 */
export function isSubBranch(branch: Branch | BranchSummary): boolean {
  return branch.role === 'sub_branch';
}
