# Dashboard Sidebar Organization

Complete overview of all dashboard pages and their sidebar organization with proper role-based access control.

## 📋 Sidebar Structure

### Navigation Sections

The sidebar is organized into **4 main sections** + **2 secondary sections**:

1. **Portal** (General Access)
2. **Inventory** (Stock Management)
3. **Commerce** (E-commerce)
4. **Finance** (Financial)
5. **User Management** (Admin - Secondary)
6. **Settings** (Superadmin - Secondary)

---

## 1️⃣ Portal Section

General application features accessible to most users.

| Page | Route | Icon | Roles | Description |
|------|-------|------|-------|-------------|
| **Dashboard** | `/dashboard` | LayoutDashboard | user, admin, superadmin, store-manager, finance-admin, finance-manager, warehouse-admin, warehouse-staff | Main dashboard overview |
| **Media Library** | `/dashboard/media` | ImagesIcon | user, admin, superadmin, store-manager, finance-admin, finance-manager, warehouse-admin, warehouse-staff | File/image management |

**Access**: All authenticated users

---

## 2️⃣ Inventory Section

Stock and branch management following Bangladesh retail flow.

### Main Pages

| Page | Route | Icon | Roles | Description |
|------|-------|------|-------|-------------|
| **POS** | `/dashboard/pos` | SquareTerminal | user, admin, superadmin, store-manager, warehouse-admin, warehouse-staff | Point of Sale system |
| **Inventory** | `/dashboard/inventory` | Box | user, admin, superadmin, store-manager, warehouse-admin, warehouse-staff | Stock management (with submenu) |
| **Branches** | `/dashboard/branches` | Building2Icon | admin, superadmin, warehouse-admin | Branch/location management |

### Inventory Submenu

| Page | Route | Description |
|------|-------|-------------|
| Stock Levels | `/dashboard/inventory` | Current stock at selected branch |
| Low Stock Alerts | `/dashboard/inventory/low-stock` | Items below reorder point |
| Transfers (Challan) | `/dashboard/inventory/transfers` | Inter-branch stock movement |
| Stock Requests | `/dashboard/inventory/requests` | Sub-branches request stock |
| Purchases | `/dashboard/inventory/purchases` | Supplier purchases (Head Office only) |
| Stock Movements | `/dashboard/inventory/movements` | Audit trail |

**Note**: All inventory submenu pages respect the parent's role access.

---

## 3️⃣ Commerce Section

E-commerce and customer management.

| Page | Route | Icon | Roles | Description |
|------|-------|------|-------|-------------|
| **Products** | `/dashboard/products` | Package | store-manager, admin, superadmin | Product catalog management |
| **Categories** | `/dashboard/categories` | Tag | store-manager, admin, superadmin | Category management |
| **Pages** | `/dashboard/cms` | FileText | store-manager, admin, superadmin | CMS pages (About, Contact, etc.) |
| **Orders** | `/dashboard/orders` | Package | store-manager, admin, superadmin | Order management |
| **Customers** | `/dashboard/customers` | Users | store-manager, admin, superadmin | Customer management |
| **Coupons** | `/dashboard/coupons` | Tag | store-manager, admin, superadmin | Discount coupons |

**Access**: Managers and Admins

---

## 4️⃣ Finance Section

Financial transactions and reporting.

| Page | Route | Icon | Roles | Description |
|------|-------|------|-------|-------------|
| **Finance Overview** | `/dashboard/finance` | Wallet | admin, superadmin, finance-admin, finance-manager | Finance dashboard and overview |
| **Transactions** | `/dashboard/transactions` | Wallet | admin, superadmin, finance-admin, finance-manager, store-manager | Financial transactions |

**Access**: Finance team, Store Managers, and Admins

---

## 5️⃣ User Management (Secondary)

Admin-only user and role management.

| Page | Route | Icon | Roles | Description |
|------|-------|------|-------|-------------|
| **User Management** | `/dashboard/users` | Users | admin, superadmin | User CRUD and role assignment |

**Access**: Admins only

---

## 6️⃣ Settings (Secondary)

Superadmin-only platform configuration.

| Page | Route | Icon | Roles | Description |
|------|-------|------|-------|-------------|
| **Settings** | `/dashboard/platform-config` | Cog | superadmin | Platform configuration |

**Access**: Superadmin only

---

## 🔐 Role Hierarchy

### Role Definitions

| Role | Access Level | Description |
|------|--------------|-------------|
| **superadmin** | Full Access | Complete system access |
| **admin** | High Access | Admin features except platform config |
| **finance-admin** | Finance Admin | Finance approvals, reporting, adjustments |
| **finance-manager** | Finance Manager | Financial operations |
| **store-manager** | Manager Access | Commerce, inventory, some finance |
| **warehouse-admin** | Warehouse Admin | Warehouse transfers, purchasing, approvals |
| **warehouse-staff** | Inventory Access | Inventory and POS only |
| **user** | Basic Access | Portal and basic inventory |

### Access Matrix

| Section | superadmin | admin | finance-admin | finance-manager | store-manager | warehouse-admin | warehouse-staff | user |
|---------|------------|-------|---------------|-----------------|---------------|-----------------|-----------------|------|
| Portal | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| POS | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Inventory | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Branches | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Commerce | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Finance | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Users | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 📂 Directory Structure

```
app/dashboard/
├── page.jsx                    # Dashboard overview
├── media/                      # Media Library
├── pos/                        # POS System
├── inventory/                  # Inventory Management
│   ├── page.jsx               # Stock Levels
│   ├── low-stock/             # Low Stock Alerts
│   ├── transfers/             # Transfers (Challan)
│   ├── requests/              # Stock Requests
│   ├── purchases/             # Purchases
│   └── movements/             # Stock Movements
├── branches/                   # Branch Management
├── products/                   # Product Management
├── categories/                 # Category Management
├── cms/                        # CMS Pages
├── orders/                     # Order Management
├── customers/                  # Customer Management
├── coupons/                    # Coupon Management
├── transactions/               # Financial Transactions
├── users/                      # User Management
└── platform-config/            # Platform Settings
```

---

## 🔧 Implementation Details

### Role Filtering Logic

The sidebar uses `hasAccess()` function in [app-sidebar.jsx](../components/custom/dashboard/app-sidebar.jsx):

```javascript
const hasAccess = (itemRoles) => {
  if (!itemRoles || itemRoles.length === 0) {
    return true; // No role restriction
  }
  const normalizedItemRoles = itemRoles
    .filter((r) => r != null)
    .map((r) => (typeof r === "string" ? r : String(r)).trim().toLowerCase());
  return normalizedItemRoles.some((role) => normalizedUserRoles.includes(role));
};
```

### Branch Context Integration

Inventory pages use `BranchContext` for branch selection:
- Displayed in sidebar header via `<BranchSwitcher />`
- Filters inventory data per selected branch
- Head office vs sub-branch feature visibility

---

## ✅ Verification Checklist

### All Pages Included

- [x] Dashboard
- [x] Media Library
- [x] POS
- [x] Inventory (with all 6 submenu items)
- [x] Branches
- [x] Products
- [x] **Categories** ✨ (Recently added)
- [x] CMS Pages
- [x] Orders
- [x] Customers
- [x] Coupons
- [x] Transactions
- [x] Users
- [x] Platform Config

### Role Assignments Verified

- [x] Portal - All roles
- [x] POS - Inventory team + admins
- [x] Inventory - Inventory team + admins
- [x] Branches - Admins only
- [x] Commerce - Managers + admins
- [x] **Transactions** - Finance team + managers + admins ✨ (Fixed)
- [x] Users - Admins only
- [x] Settings - Superadmin only

### Organization

- [x] Logical grouping by function
- [x] Proper icon assignments
- [x] Submenu for complex sections (Inventory)
- [x] Secondary navigation for admin features
- [x] Clean imports (removed unused icons)

---

## 🚀 Recent Updates

### Changes Made

1. **Added Categories Page** (`/dashboard/categories`)
   - Icon: Tag
   - Roles: store-manager, admin, superadmin
   - Position: After Products in Commerce section

2. **Fixed Transactions Roles**
   - Old: `["user"]`
   - New: `["admin", "superadmin", "finance-admin", "finance-manager", "store-manager"]`
   - Reason: Finance features should be restricted to finance team (including finance-admin)

3. **Fixed Customers Roles**
   - Old: `["user"]`
   - New: `["store-manager", "admin", "superadmin"]`
   - Icon: Changed to `Users` for consistency

4. **Added Missing Admin Roles**
   - Added `finance-admin` role (Finance approvals, reporting, adjustments)
   - Added `warehouse-admin` role (Warehouse transfers, purchasing, approvals)
   - Updated all sections to include these roles per auth.md documentation

5. **Cleaned Up Imports**
   - Removed 15 unused icon imports
   - Kept only actively used icons

---

## 🎯 Best Practices

### Adding New Pages

When adding a new dashboard page:

1. **Create the page directory and file**
   ```
   app/dashboard/new-feature/page.jsx
   ```

2. **Add to sidebar-data.js**
   ```javascript
   {
     title: "New Feature",
     url: "/dashboard/new-feature",
     icon: IconName,
     roles: ["admin", "superadmin"],
   }
   ```

3. **Import the icon**
   ```javascript
   import { IconName } from "lucide-react";
   ```

4. **Place in appropriate section**
   - Portal: General features
   - Inventory: Stock-related
   - Commerce: E-commerce features
   - Finance: Financial features

5. **Set appropriate roles**
   - Consider who needs access
   - Use restrictive defaults
   - Test with different user roles

### Role Assignment Guidelines

- **All users**: Portal features (dashboard, media)
- **Warehouse team**: POS, Inventory features (warehouse-admin has approval powers)
- **Store managers**: Commerce features (products, orders, customers)
- **Finance team**: Transactions, financial reports (finance-admin has approval powers)
- **Admins**: User management, most features
- **Superadmin**: Everything including platform config

**Admin Role Hierarchy**:
- `superadmin` > `admin` > `finance-admin` > `finance-manager`
- `superadmin` > `admin` > `warehouse-admin` > `warehouse-staff`
- `store-manager` has cross-functional access to commerce and some finance

---

## 📝 Notes

### Inventory Submenu Behavior

The Inventory section has a **collapsible submenu** that shows:
- 6 sub-pages for different inventory functions
- All inherit parent role restrictions
- Navigation uses `InventoryNav` component for tab-style navigation

### Branch-Specific Pages

These pages respect branch context:
- POS
- All Inventory pages
- Orders (for branch-specific filtering)

### Future Considerations

Potential additions:
- Reports section (analytics, dashboards)
- Marketing section (campaigns, newsletters)
- Settings submenu (per-user settings, preferences)
- Help/Support section

---

## 🔍 Troubleshooting

### Page Not Showing in Sidebar

**Check**:
1. Page exists in `app/dashboard/[page]/`
2. Added to `sidebar-data.js`
3. User has required role
4. Icon is imported
5. Section has items after role filtering

### Role Issues

**Check**:
1. User roles are normalized (lowercase)
2. Role names match exactly
3. At least one role matches between user and page
4. Parent section is accessible

### Icons Not Displaying

**Check**:
1. Icon imported from `lucide-react`
2. Correct icon name spelling
3. No unused imports causing conflicts
