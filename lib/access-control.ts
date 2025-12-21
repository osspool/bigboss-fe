import type { Branch } from "@/types/branch.types";

// ============================================
// ROLE NORMALIZATION & BASIC CHECKS
// ============================================

export function normalizeRoles(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input
      .flat()
      .filter((r) => r != null)
      .map((r) => (typeof r === "string" ? r : String(r)).trim().toLowerCase())
      .filter(Boolean);
  }
  if (typeof input === "string") {
    const v = input.trim().toLowerCase();
    return v ? [v] : [];
  }
  return [];
}

export function hasAnyRole(userRoles: unknown, required: string[]): boolean {
  const roles = normalizeRoles(userRoles);
  const requiredNormalized = normalizeRoles(required);
  if (requiredNormalized.length === 0) return true;
  return requiredNormalized.some((r) => roles.includes(r));
}

export function isAdminUser(userRoles: unknown): boolean {
  return hasAnyRole(userRoles, ["admin", "superadmin"]);
}

export function isWarehouseUser(userRoles: unknown): boolean {
  return hasAnyRole(userRoles, ["warehouse-admin", "warehouse-staff"]);
}

export function isFinanceUser(userRoles: unknown): boolean {
  return hasAnyRole(userRoles, ["finance-admin", "finance-manager"]);
}

export function isStaffUser(userRoles: unknown): boolean {
  return hasAnyRole(userRoles, [
    "admin",
    "superadmin",
    "store-manager",
    "finance-manager",
    "warehouse-staff",
  ]);
}

export function canManageBranches(userRoles: unknown): boolean {
  return isAdminUser(userRoles);
}

// ============================================
// BRANCH-SCOPED ROLE CHECKS
// ============================================

/**
 * Check if user has specific branch-level roles at the current branch
 */
export function hasBranchRole(branchRoles: unknown, required: string[]): boolean {
  const roles = normalizeRoles(branchRoles);
  const requiredNormalized = normalizeRoles(required);
  if (requiredNormalized.length === 0) return true;
  return requiredNormalized.some((r) => roles.includes(r));
}

/**
 * Combined check: system roles OR branch roles
 */
export function hasSystemOrBranchRole(
  systemRoles: unknown,
  branchRoles: unknown,
  requiredSystemRoles: string[],
  requiredBranchRoles: string[]
): boolean {
  return (
    hasAnyRole(systemRoles, requiredSystemRoles) ||
    hasBranchRole(branchRoles, requiredBranchRoles)
  );
}

// ============================================
// INVENTORY-SPECIFIC PERMISSIONS
// ============================================

/**
 * Check if user can view inventory
 */
export function canViewInventory(systemRoles: unknown, branchRoles: unknown): boolean {
  // System-level access
  if (hasAnyRole(systemRoles, [
    "admin", "superadmin", "warehouse-admin", "warehouse-staff",
    "store-manager", "finance-admin", "finance-manager"
  ])) {
    return true;
  }

  // Branch-level access
  return hasBranchRole(branchRoles, [
    "branch_manager", "inventory_staff", "stock_receiver",
    "stock_requester", "cashier", "viewer"
  ]);
}

/**
 * Check if user can record purchases (head office only + warehouse staff)
 */
export function canRecordPurchases(
  systemRoles: unknown,
  branchRoles: unknown,
  branch: Branch | null
): boolean {
  if (!branch || branch.role !== "head_office") return false;

  // System-level: admin or warehouse staff
  if (hasAnyRole(systemRoles, ["admin", "superadmin", "warehouse-admin", "warehouse-staff"])) {
    return true;
  }

  // Branch-level: branch manager or inventory staff at head office
  return hasBranchRole(branchRoles, ["branch_manager", "inventory_staff"]);
}

/**
 * Check if user can create transfers (head office only)
 */
export function canCreateTransfer(
  systemRoles: unknown,
  branchRoles: unknown,
  branch: Branch | null
): boolean {
  if (!branch || branch.role !== "head_office") return false;

  // System-level: admin or warehouse staff
  if (hasAnyRole(systemRoles, ["admin", "superadmin", "warehouse-admin", "warehouse-staff"])) {
    return true;
  }

  // Branch-level: branch manager or inventory staff
  return hasBranchRole(branchRoles, ["branch_manager", "inventory_staff"]);
}

/**
 * Check transfer type permissions (sub_to_sub, sub_to_head require admin)
 */
export function canCreateTransferType(
  systemRoles: unknown,
  transferType: "head_to_sub" | "sub_to_sub" | "sub_to_head"
): boolean {
  if (transferType === "head_to_sub") {
    return hasAnyRole(systemRoles, ["admin", "superadmin", "warehouse-admin", "warehouse-staff"]);
  }
  // sub_to_sub and sub_to_head require admin/superadmin only
  return isAdminUser(systemRoles);
}

/**
 * Check if user can create stock requests (sub-branches only)
 */
export function canCreateStockRequest(
  systemRoles: unknown,
  branchRoles: unknown,
  branch: Branch | null
): boolean {
  if (!branch || branch.role === "head_office") return false;

  // System-level: admin or warehouse/store staff
  if (hasAnyRole(systemRoles, ["admin", "superadmin", "warehouse-staff", "store-manager"])) {
    return true;
  }

  // Branch-level: branch manager, inventory staff, or stock requester
  return hasBranchRole(branchRoles, ["branch_manager", "inventory_staff", "stock_requester"]);
}

/**
 * Check if user can receive transfers
 */
export function canReceiveTransfer(
  systemRoles: unknown,
  branchRoles: unknown,
  branch: Branch | null
): boolean {
  if (!branch) return false;

  // System-level access
  if (hasAnyRole(systemRoles, ["admin", "superadmin", "warehouse-staff", "store-manager"])) {
    return true;
  }

  // Branch-level: branch manager, inventory staff, or stock receiver
  return hasBranchRole(branchRoles, ["branch_manager", "inventory_staff", "stock_receiver"]);
}

/**
 * Check if user can approve/fulfill stock requests (head office only)
 */
export function canManageStockRequests(
  systemRoles: unknown,
  branchRoles: unknown,
  branch: Branch | null
): boolean {
  if (!branch || branch.role !== "head_office") return false;

  // System-level: admin or warehouse admin
  if (hasAnyRole(systemRoles, ["admin", "superadmin", "warehouse-admin"])) {
    return true;
  }

  // Branch-level: branch manager at head office
  return hasBranchRole(branchRoles, ["branch_manager"]);
}

/**
 * Check if user can view stock movements (audit trail)
 */
export function canViewStockMovements(systemRoles: unknown, branchRoles: unknown): boolean {
  // System-level: admin, warehouse, or finance roles
  if (hasAnyRole(systemRoles, [
    "admin", "superadmin", "warehouse-admin", "warehouse-staff",
    "finance-admin", "finance-manager", "store-manager"
  ])) {
    return true;
  }

  // Branch-level: branch manager or inventory staff (not cashier/viewer)
  return hasBranchRole(branchRoles, ["branch_manager", "inventory_staff"]);
}

// ============================================
// STOCK ADJUSTMENT PERMISSIONS
// ============================================

export type StockAdjustmentCapability =
  | { mode: "none"; reason: string }
  | { mode: "set_any" }
  | { mode: "set_decrease_only"; max: number; reason: string };

/**
 * Determine stock adjustment capability based on branch type and user roles.
 *
 * Rules (per API docs):
 * 1. Head Office: ONLY admin/superadmin can adjust stock
 *    - Stock enters via Purchases (not adjustments)
 *    - Adjustments are for corrections only
 *
 * 2. Sub-branches:
 *    - Admin/superadmin: can set any stock level
 *    - Branch manager/inventory staff: can only DECREASE stock (corrections for damage/loss)
 *    - Stock INCREASES must come from Transfers, not adjustments
 */
export function getStockAdjustmentCapability(
  systemRoles: unknown,
  branchRoles: unknown,
  branch: Branch | null,
  currentStock: number
): StockAdjustmentCapability {
  if (!branch) {
    return { mode: "none", reason: "No branch selected" };
  }

  const admin = isAdminUser(systemRoles);
  const hasBranchMgmtRole = hasBranchRole(branchRoles, ["branch_manager", "inventory_staff"]);

  if (branch.role === "head_office") {
    // Head office adjustments require admin/superadmin ONLY (per API docs)
    // Stock enters via Purchases; adjustments are for admin corrections only
    if (!admin) {
      return {
        mode: "none",
        reason: "Head office stock adjustments require admin/superadmin role. Use Purchases to add stock.",
      };
    }
    return { mode: "set_any" };
  }

  // Sub-branches: stock should come from Transfers, not adjustments
  // Admin can do anything
  if (admin) {
    return { mode: "set_any" };
  }

  // Branch manager/inventory staff can only DECREASE stock (for shrinkage, damage, recount)
  if (hasBranchMgmtRole) {
    return {
      mode: "set_decrease_only",
      max: Math.max(0, currentStock),
      reason: "Sub-branches can only decrease stock via adjustments. Use Stock Requests to get more stock from Head Office.",
    };
  }

  // Other users cannot adjust stock
  return {
    mode: "none",
    reason: "Stock adjustments require admin/superadmin or branch manager/inventory staff role",
  };
}

