# Frontend API Integration Guide

Quick reference for integrating with the backend APIs. Covers e-commerce checkout, POS operations, and inventory management.

---

## API Overview

| API | Purpose | Auth Required |
|-----|---------|---------------|
| `productApi` | Product catalog (public + admin CRUD) | Public read, Admin write |
| `cartApi` | Shopping cart management | User |
| `orderApi` | E-commerce order management | User |
| `posApi` | POS operations (orders, inventory, branches) | Staff (admin/store-manager) |
| `branchApi` | Branch CRUD (admin) | Admin |

---

## 1. E-Commerce Flow: Product → Cart → Checkout

### Step 1: Browse Products

```typescript
import { productApi } from '@/api/platform/product-api';

// List products with filters
const products = await productApi.getAll({
  params: {
    category: 'mens',
    style: ['casual', 'street'],
    'basePrice[lte]': 2000,
    sort: '-createdAt',
    limit: 24,
  },
});

// Get single product by slug (for product detail page)
const product = await productApi.getBySlug({ slug: 'cool-graphic-tshirt' });

// Get recommendations
const related = await productApi.getRecommendations({ productId: product.data._id });
```

### Step 2: Add to Cart

```typescript
import { cartApi } from '@/api/platform/cart-api';

// Add item with variation
await cartApi.addItem({
  token,
  data: {
    productId: product._id,
    quantity: 1,
    variations: [
      { name: 'Size', option: { value: 'M', priceModifier: 0 } },
      { name: 'Color', option: { value: 'Red', priceModifier: 50 } },
    ],
  },
});

// Get cart
const cart = await cartApi.get({ token });

// Update quantity
await cartApi.updateItem({
  token,
  itemId: cart.data.items[0]._id,
  data: { quantity: 2 },
});

// Remove item
await cartApi.removeItem({ token, itemId: cart.data.items[0]._id });
```

### Step 3: Checkout

```typescript
import { orderApi } from '@/api/platform/order-api';

// Create order from cart
const order = await orderApi.create({
  token,
  data: {
    deliveryAddress: {
      addressLine1: '123 Main St',
      city: 'Dhaka',
      phone: '01712345678',
      recipientName: 'John Doe',
    },
    delivery: {
      method: 'standard',
      price: 60,
      estimatedDays: 3,
    },
    paymentData: {
      type: 'bkash',
      senderPhone: '01712345678',
    },
    couponCode: 'SAVE10', // optional
  },
});

// Track order
const orderDetails = await orderApi.getById({ token, id: order.data._id });

// Cancel order (if allowed)
await orderApi.cancel({
  token,
  id: order.data._id,
  data: { reason: 'Changed my mind' },
});
```

---

## 2. POS Flow: Scan → Add → Checkout

### Step 1: Initialize POS Session

```typescript
import { posApi, type PosCartState } from '@/api/platform/pos-api';

// Get default branch (auto-creates if none exists)
const branch = await posApi.getDefaultBranch({ token });

// Or list all active branches for selection
const branches = await posApi.getBranches({ token });

// Initialize cart state (client-side)
const cart: PosCartState = {
  items: [],
  subtotal: 0,
  discount: 0,
  total: 0,
  branchId: branch.data._id,
};
```

### Step 2: Scan Products

```typescript
import { lookupToCartItem, calculateCartTotals } from '@/api/platform/pos-api';

// Scan barcode or enter SKU
const result = await posApi.lookup({
  token,
  code: '1234567890', // barcode or SKU
  branchId: cart.branchId,
});

if (result.success && result.data) {
  // Convert to cart item
  const cartItem = lookupToCartItem(result.data, 1);

  if (cartItem) {
    // Check if item already in cart
    const existingIndex = cart.items.findIndex(
      i => i.productId === cartItem.productId && i.variantSku === cartItem.variantSku
    );

    if (existingIndex >= 0) {
      // Increment quantity
      cart.items[existingIndex].quantity += 1;
      cart.items[existingIndex].lineTotal =
        cart.items[existingIndex].quantity * cart.items[existingIndex].unitPrice;
    } else {
      // Add new item
      cart.items.push(cartItem);
    }

    // Recalculate totals
    const totals = calculateCartTotals(cart.items, cart.discount);
    cart.subtotal = totals.subtotal;
    cart.total = totals.total;
  }
}
```

### Step 3: Add Customer (Optional)

```typescript
// Walk-in customer (no customer record)
cart.customer = undefined;

// Or quick customer by phone (auto-creates if not exists)
cart.customer = {
  phone: '01712345678',
  name: 'John Doe',
};

// Or existing customer
cart.customer = {
  id: 'existing-customer-id',
};
```

### Step 4: Apply Discount (Optional)

```typescript
cart.discount = 100; // Flat discount amount

// Recalculate
const totals = calculateCartTotals(cart.items, cart.discount);
cart.total = totals.total;
```

### Step 5: Complete Sale

```typescript
import { cartToOrderPayload } from '@/api/platform/pos-api';

// Convert cart to order payload
const payload = cartToOrderPayload(cart);

// Add payment info
payload.payment = {
  method: 'cash',
  amount: cart.total,
};

// Create order (atomic: validates stock, decrements, creates order)
const order = await posApi.createOrder({ token, data: payload });

if (order.success) {
  // Get receipt for printing
  const receipt = await posApi.getReceipt({ token, orderId: order.data._id });

  // Print receipt...
  console.log(receipt.data);

  // Clear cart
  cart.items = [];
  cart.subtotal = 0;
  cart.discount = 0;
  cart.total = 0;
  cart.customer = undefined;
}
```

---

## 3. Inventory Management

### Check Stock Levels

```typescript
// Get stock for a product (all branches)
const stock = await posApi.getStock({ token, productId: '123' });

// Get stock for specific branch
const branchStock = await posApi.getStock({
  token,
  productId: '123',
  branchId: 'branch-id',
});

// Response includes per-branch quantities
stock.data.forEach(entry => {
  console.log(`Branch: ${entry.branch}, Qty: ${entry.quantity}`);
});
```

### Set Stock (Manual Adjustment)

```typescript
// Set stock for simple product
await posApi.setStock({
  token,
  productId: '123',
  data: {
    quantity: 50,
    branchId: 'branch-id',
    notes: 'Received new shipment',
  },
});

// Set stock for variant
await posApi.setStock({
  token,
  productId: '123',
  data: {
    variantSku: 'TSHIRT-RED-M',
    quantity: 25,
    branchId: 'branch-id',
    notes: 'Inventory recount',
  },
});
```

### Low Stock Alerts

```typescript
// Get items below reorder point
const lowStock = await posApi.getLowStock({ token });

// Filter by branch
const branchLowStock = await posApi.getLowStock({
  token,
  params: {
    branchId: 'branch-id',
    threshold: 10, // Custom threshold
  },
});
```

### Stock Movement History

```typescript
// Get movement history for a product
const movements = await posApi.getMovements({
  token,
  params: {
    productId: '123',
    type: 'sale', // sale, return, adjustment, transfer_in, transfer_out
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    page: 1,
    limit: 50,
  },
});
```

### Batch Availability Check

```typescript
// Check if items are available before checkout
const availability = await posApi.checkAvailability({
  token,
  items: [
    { productId: '123', variantSku: 'SIZE-M', quantity: 2 },
    { productId: '456', quantity: 1 },
  ],
  branchId: 'branch-id',
});

if (!availability.data.available) {
  // Show unavailable items
  availability.data.unavailableItems.forEach(item => {
    console.log(`${item.productName}: need ${item.requested}, have ${item.available}`);
  });
}
```

---

## 4. Branch Management (Admin)

```typescript
import { branchApi } from '@/api/platform/branch-api';

// List all branches
const branches = await branchApi.getAll({
  token,
  params: { type: 'store', isActive: true },
});

// Create new branch
await branchApi.create({
  token,
  data: {
    code: 'CTG-1',
    name: 'Chittagong Store',
    type: 'store',
    address: {
      line1: '123 Main Street',
      city: 'Chittagong',
    },
    phone: '01812345678',
  },
});

// Update branch
await branchApi.update({
  token,
  id: 'branch-id',
  data: { name: 'Chittagong Flagship Store' },
});

// Set as default
await branchApi.setDefault({ token, id: 'branch-id' });

// Get active branches (simple list, no pagination)
const activeBranches = await branchApi.getActive({ token });
```

---

## Type Imports

```typescript
// Product types
import type {
  Product,
  ProductPayload,
  ProductQueryParams,
  VariationOption,
} from '@/types/product.types';

// Order types
import type {
  Order,
  OrderItem,
  CreateOrderPayload,
  OrderStatus,
  PaymentMethod,
} from '@/types/order.types';

// Inventory types
import type {
  Branch,
  StockEntry,
  StockMovement,
  PosLookupResponse,
  CreatePosOrderPayload,
  Receipt,
} from '@/types/inventory.types';

// POS UI helpers
import type {
  PosCartItem,
  PosCartState,
} from '@/api/platform/pos-api';
```

---

## Key Differences: E-Commerce vs POS

| Aspect | E-Commerce | POS |
|--------|------------|-----|
| Cart | Server-side (cartApi) | Client-side (PosCartState) |
| Items | From cart | Direct payload |
| Customer | Required (from auth) | Optional (walk-in supported) |
| Delivery | Required | Not applicable |
| Payment | Async verification | Immediate (cash/card) |
| Stock | Checked at checkout | Real-time with branch context |
| Order Source | `source: 'web'` | `source: 'pos'` |

---

## Stock Management Notes

1. **Product.quantity is read-only** - Auto-synced from StockEntry for display
2. **Use posApi.setStock()** - To modify stock levels
3. **Stock is per-branch** - Each branch has separate inventory
4. **POS auto-decrements** - Stock decremented atomically on order creation
5. **Transactional** - All-or-nothing; if any item fails, order is rejected
