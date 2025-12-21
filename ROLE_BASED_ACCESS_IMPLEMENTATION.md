# Role-Based Access Control Implementation Summary

## ✅ Completed Implementations

### 1. Extended [lib/access-control.ts](lib/access-control.ts)

Added comprehensive permission checking functions that support **3 layers of access control**:

#### System Role Helpers
- `isWarehouseUser()` - Check for warehouse-admin/warehouse-staff
- `isFinanceUser()` - Check for finance-admin/finance-manager
- Existing: `isAdminUser()`, `isStaffUser()`, `canManageBranches()`

#### Branch-Scoped Role Helpers
- `hasBranchRole()` - Check branch-level roles (branch_manager, inventory_staff, cashier, stock_receiver, stock_requester, viewer)
- `hasSystemOrBranchRole()` - Combined check for system OR branch roles

#### Inventory-Specific Permissions
- ✅ `canViewInventory(systemRoles, branchRoles)` - View inventory pages
- ✅ `canRecordPurchases(systemRoles, branchRoles, branch)` - Head office purchases
- ✅ `canCreateTransfer(systemRoles, branchRoles, branch)` - Create transfers from head office
- ✅ `canCreateTransferType(systemRoles, transferType)` - Validate transfer types (head_to_sub, sub_to_sub, sub_to_head)
- ✅ `canCreateStockRequest(systemRoles, branchRoles, branch)` - Sub-branches create stock requests
- ✅ `canReceiveTransfer(systemRoles, branchRoles, branch)` - Receive transfers at branch
- ✅ `canManageStockRequests(systemRoles, branchRoles, branch)` - Head office approve/fulfill requests
- ✅ `canViewStockMovements(systemRoles, branchRoles)` - View audit trail
- ✅ `getStockAdjustmentCapability(systemRoles, branchRoles, branch, currentStock)` - Updated to support branch roles

### 2. Updated [sidebar-data.js](sidebar-data.js)

Removed generic "user" role and ensured proper role assignments:

**Before:**
```javascript
roles: ["user", "admin", "superadmin", "store-manager", "warehouse-admin", "warehouse-staff"]
```

**After:**
```javascript
// Dashboard (line 56)
roles: ["admin", "superadmin", "store-manager", "finance-admin", "finance-manager", "warehouse-admin", "warehouse-staff"]

// Media Library (line 64)
roles: ["admin", "superadmin", "store-manager", "warehouse-admin", "warehouse-staff"]

// POS (line 77)
roles: ["admin", "superadmin", "store-manager", "warehouse-staff"]

// Inventory (line 110)
roles: ["admin", "superadmin", "store-manager", "warehouse-admin", "warehouse-staff", "finance-admin", "finance-manager"]
```

### 3. Added Page-Level Guards

Updated [app/dashboard/inventory/page.jsx](app/dashboard/inventory/page.jsx):
- ✅ Added `canViewInventory()` permission check
- ✅ Returns `<AccessDenied />` if user lacks permission
- ✅ Passes both `userRoles` and `branchRoles` to `InventoryClient`

---

## 🔄 Required Component Updates

The following components need to be updated to **accept and utilize branch-scoped roles**:

### Components to Update

#### 1. [InventoryClient.tsx](feature/inventory/dashboard/stock/InventoryClient.tsx)
**Current:** Only accepts `userRoles`
**Needs:**
```typescript
interface InventoryClientProps {
  token: string;
  userRoles?: unknown;
  branchRoles?: unknown;  // ← Add this
  initialLimit?: number;
}

// Update getStockAdjustmentCapability calls:
getStockAdjustmentCapability(roles, normalizedBranchRoles, selectedBranch, currentStock)
```

#### 2. [TransfersClient.tsx](feature/inventory/dashboard/transfers/transfers-client.tsx)
**Needs:**
```typescript
interface TransfersClientProps {
  token: string;
  userRoles?: unknown;  // ← Add system roles
  branchRoles?: unknown;  // ← Add branch roles
}

// Use canCreateTransfer() to disable create button
const createDisabled = !selectedBranch || !canCreateTransfer(userRoles, branchRoles, selectedBranch);
```

**Update page:**
```jsx
// app/dashboard/inventory/transfers/page.jsx
<TransfersClient
  token={token}
  userRoles={roles}
  branchRoles={branchRoles}
/>
```

#### 3. [PurchasesClient.tsx](feature/inventory/dashboard/purchases/purchases-client.tsx)
**Needs:**
```typescript
interface PurchasesClientProps {
  token: string;
  userRoles?: unknown;  // ← Add
  branchRoles?: unknown;  // ← Add
}

// Use canRecordPurchases() instead of just isHeadOffice
const createDisabled = !canRecordPurchases(userRoles, branchRoles, selectedBranch);
```

#### 4. [RequestsClient.tsx](feature/inventory/dashboard/requests/requests-client.tsx)
**Needs:**
```typescript
interface RequestsClientProps {
  token: string;
  userRoles?: unknown;  // ← Add
  branchRoles?: unknown;  // ← Add
}

// Use permission functions for create/approve buttons
const createDisabled = !canCreateStockRequest(userRoles, branchRoles, selectedBranch);
const canApproveRequests = canManageStockRequests(userRoles, branchRoles, selectedBranch);
```

#### 5. [transfer-create-dialog.tsx](feature/inventory/dashboard/transfers/transfer-create-dialog.tsx)
**Needs:**
Add transfer type validation:
```typescript
const handleSubmit = async () => {
  // ... existing validation ...

  // Validate transfer type permission
  const transferType = getTransferType(senderBranch, receiverBranch);
  if (!canCreateTransferType(userRoles, transferType)) {
    toast.error("You don't have permission for this transfer type. sub_to_sub and sub_to_head require admin/superadmin.");
    return;
  }

  // ... proceed with create
};
```

---

## 📋 Remaining Page Guards

Add permission guards to these pages:

### app/dashboard/inventory/transfers/page.jsx
```jsx
import { canViewInventory } from "@/lib/access-control";

const branchRoles = session?.branch?.roles ?? [];
if (!canViewInventory(roles, branchRoles)) {
  return <AccessDenied />;
}
```

### app/dashboard/inventory/purchases/page.jsx
Same as above

### app/dashboard/inventory/requests/page.jsx
Same as above

### app/dashboard/inventory/movements/page.jsx
```jsx
import { canViewStockMovements } from "@/lib/access-control";

const branchRoles = session?.branch?.roles ?? [];
if (!canViewStockMovements(roles, branchRoles)) {
  return <AccessDenied />;
}
```

### app/dashboard/inventory/low-stock/page.jsx
```jsx
import { canViewInventory } from "@/lib/access-control";

const branchRoles = session?.branch?.roles ?? [];
if (!canViewInventory(roles, branchRoles)) {
  return <AccessDenied />;
}
```

---

## 🎯 Permission Flow Examples

### Example 1: Sub-Branch Cashier
**User:**
- System role: `store-manager`
- Branch role: `cashier`
- Current branch: Sub-branch (role: `sub_branch`)

**Permissions:**
- ✅ Can view inventory (has system role `store-manager`)
- ❌ Cannot create transfers (not at head office)
- ❌ Cannot record purchases (not at head office)
- ✅ Can create stock requests (at sub-branch, has system role)
- ✅ Can receive transfers (has system role)
- ❌ Cannot adjust stock (cashier role insufficient for stock adjustments)

### Example 2: Head Office Inventory Staff
**User:**
- System role: `warehouse-staff`
- Branch role: `inventory_staff`
- Current branch: Head office (role: `head_office`)

**Permissions:**
- ✅ Can view inventory (has system role)
- ✅ Can create transfers (at head office + has system role)
- ✅ Can record purchases (at head office + has system role)
- ❌ Cannot create stock requests (at head office)
- ✅ Can receive transfers (has system role)
- ✅ Can adjust stock (has branch role `inventory_staff`)

### Example 3: Sub-Branch Manager
**User:**
- System role: None (only branch assignment)
- Branch role: `branch_manager`
- Current branch: Sub-branch (role: `sub_branch`)

**Permissions:**
- ✅ Can view inventory (has branch role `branch_manager`)
- ❌ Cannot create transfers (not at head office, no system role)
- ❌ Cannot record purchases (not at head office)
- ✅ Can create stock requests (at sub-branch + has branch role)
- ✅ Can receive transfers (has branch role `branch_manager`)
- ✅ Can adjust stock (decrease only) (has branch role at sub-branch)

---

## 🔧 Quick Reference: Permission Functions

| Function | Parameters | Returns | Use Case |
|----------|-----------|---------|----------|
| `canViewInventory` | `(systemRoles, branchRoles)` | boolean | Page guard for inventory sections |
| `canRecordPurchases` | `(systemRoles, branchRoles, branch)` | boolean | Disable/show purchase button |
| `canCreateTransfer` | `(systemRoles, branchRoles, branch)` | boolean | Disable/show transfer creation |
| `canCreateTransferType` | `(systemRoles, transferType)` | boolean | Validate transfer type on submit |
| `canCreateStockRequest` | `(systemRoles, branchRoles, branch)` | boolean | Disable/show request creation |
| `canReceiveTransfer` | `(systemRoles, branchRoles, branch)` | boolean | Show/hide receive button |
| `canManageStockRequests` | `(systemRoles, branchRoles, branch)` | boolean | Show/hide approve/fulfill buttons |
| `canViewStockMovements` | `(systemRoles, branchRoles)` | boolean | Page guard for movements page |
| `getStockAdjustmentCapability` | `(systemRoles, branchRoles, branch, currentStock)` | Capability | Determine adjustment mode |

---

## ✨ Benefits of This Implementation

1. **Three-Layer Security:**
   - System roles (global authority)
   - Branch roles (branch-specific permissions)
   - Branch type (head_office vs sub_branch flow rules)

2. **Flexible Access Control:**
   - Admins have global access
   - Branch managers control their branches
   - Specialized roles (cashier, stock_receiver) have limited scope

3. **Proper Flow Enforcement:**
   - Purchases only at head office
   - Transfers from head office to sub-branches
   - Stock requests from sub-branches to head office
   - Sub-branches can only decrease stock (use transfers to increase)

4. **Audit Compliance:**
   - Movement history restricted to management roles
   - Cost/financial data accessible to finance roles
   - Clear permission trails

---

## 🚀 Next Steps

1. Update remaining inventory pages with permission guards
2. Update all client components to accept `branchRoles` prop
3. Update all parent pages to pass `branchRoles` from session
4. Add transfer type validation in transfer creation dialog
5. Test with different role combinations
6. Document role assignments for deployment

---

## 📝 Notes

- The sidebar already filters navigation based on roles (via `app-sidebar.jsx`)
- Session data from `auth.ts` includes `session.branch.roles` (line 14, 46, 293)
- User form schema ([user-form-schema.js](user-form-schema.js#L22-L29)) has branch role options defined
- Branch role options: `branch_manager`, `inventory_staff`, `cashier`, `stock_receiver`, `stock_requester`, `viewer`
