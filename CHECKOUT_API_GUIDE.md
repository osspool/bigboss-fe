# Checkout API Guide

Quick reference for implementing checkout flow with order creation.

> **Payment Gateway:** This guide covers **manual payment gateway** (default). Customers provide basic payment info (type, TrxID, sender phone). Advanced fields like `paymentDetails` are library-managed for automated gateways (Stripe, SSLCommerz, bKash API).

---

## Checkout Flow

```
1. Shopping  → Add items to cart (POST /api/v1/cart/items)
2. Checkout  → Fetch cart + platform config
3. Order     → POST /api/v1/orders with delivery + payment info
4. Backend   → Processes cart, validates coupon, reserves inventory, creates order, clears cart
```

---

## Create Order (Checkout)

```http
POST /api/v1/orders
Authorization: Bearer <token>
```

### Request Body

```json
{
  "deliveryAddress": {
    "recipientName": "John Doe",          // Optional: For gift orders or different recipient
    "addressLine1": "123 Main St",
    "addressLine2": "Apt 4B",             // Optional
    "city": "Dhaka",
    "state": "Dhaka Division",            // Optional
    "postalCode": "1200",                 // Optional
    "country": "Bangladesh",              // Optional, defaults to Bangladesh
    "phone": "01712345678"
  },
  "delivery": {
    "method": "standard",                 // From platform config
    "price": 60,                          // From platform config
    "estimatedDays": 3                    // Optional
  },
  "paymentData": {
    "type": "bkash",                      // cash | bkash | nagad | rocket | bank | card
    "reference": "BGH3K5L90P",           // Transaction ID (TrxID) from payment
    "senderPhone": "01712345678"         // Required for mobile wallets (bkash/nagad/rocket)
  },
  "isGift": true,                         // Optional: true if ordering for someone else
  "couponCode": "SAVE10",                 // Optional: discount coupon
  "notes": "Leave at door"                // Optional: order notes
}
```

### Required Fields

| Field | Required | Notes |
|-------|----------|-------|
| `deliveryAddress.addressLine1` | ✅ Yes | Street address |
| `deliveryAddress.city` | ✅ Yes | City name |
| `deliveryAddress.phone` | ✅ Yes | Contact phone (01XXXXXXXXX) |
| `delivery.method` | ✅ Yes | Delivery method from platform config |
| `delivery.price` | ✅ Yes | Delivery price from platform config |
| `paymentData.type` | ✅ Yes | cash, bkash, nagad, rocket, bank, card |
| `paymentData.reference` | ⚠️ Recommended | Transaction ID (helps admin verify) |
| `paymentData.senderPhone` | ⚠️ Required for wallets | For bkash/nagad/rocket (01XXXXXXXXX) |

### Response

```json
{
  "success": true,
  "data": {
    "_id": "order_id",
    "customer": "customer_id",
    "customerName": "Jane Smith",         // Buyer's name (snapshot)
    "customerPhone": "01787654321",       // Buyer's phone (snapshot)
    "customerEmail": "jane@example.com",  // Buyer's email (snapshot)
    "userId": "user_id",                  // Link to user account
    "items": [...],
    "subtotal": 1500,
    "discountAmount": 150,
    "totalAmount": 1410,
    "delivery": {
      "method": "standard",
      "price": 60
    },
    "deliveryAddress": {
      "recipientName": "John Doe",        // Gift recipient
      "addressLine1": "123 Main St",
      "city": "Dhaka",
      "phone": "01712345678"
    },
    "isGift": true,                       // This is a gift order
    "status": "pending",
    "currentPayment": {
      "transactionId": "txn_id",
      "amount": 141000,                   // In paisa (multiply by 100)
      "status": "pending",
      "method": "bkash",
      "reference": "BGH3K5L90P"
    },
    "couponApplied": {
      "code": "SAVE10",
      "discountType": "percentage",
      "discountValue": 10,
      "discountAmount": 150
    },
    "createdAt": "2025-12-08T10:00:00.000Z",
    "updatedAt": "2025-12-08T10:00:00.000Z"
  },
  "transaction": "txn_id",
  "message": "Order created successfully"
}
```

---

## New Features

### 🎁 Gift Orders

When `isGift: true`, use `deliveryAddress.recipientName` for the gift recipient:

```json
{
  "deliveryAddress": {
    "recipientName": "John Doe",     // Gift recipient's name
    "addressLine1": "123 Main St",
    "city": "Dhaka",
    "phone": "01712345678"           // Gift recipient's phone
  },
  "isGift": true,
  "notes": "Birthday gift - please include greeting card"
}
```

**Order stores both:**
- `customerName`, `customerPhone`, `customerEmail` → Buyer (who placed order)
- `deliveryAddress.recipientName` → Gift recipient (where to deliver)

### 📦 Customer Snapshot

Orders now store customer data at order time (no populate needed):
- `customerName` - Buyer's name
- `customerPhone` - Buyer's phone
- `customerEmail` - Buyer's email
- `userId` - Link to user account (if logged in)

This means you can display order history without extra queries!

---

## Load Checkout Data

Before showing checkout page, fetch cart and platform config:

```javascript
// 1. Get cart items
const cartRes = await fetch('/api/v1/cart', {
  headers: { Authorization: `Bearer ${token}` }
});
const { data: cart } = await cartRes.json();

// 2. Get platform config (delivery + payment options)
const configRes = await fetch('/api/v1/platform/config?select=payment,deliveryOptions');
const { data: config } = await configRes.json();

// 3. Extract data for checkout UI
const deliveryOptions = config.deliveryOptions.filter(opt => opt.isActive);

// 4. Payment methods available
const paymentMethods = [];
if (config.payment.cash?.enabled) {
  paymentMethods.push({ type: 'cash', label: 'Cash on Delivery' });
}
if (config.payment.bkash?.walletNumber) {
  paymentMethods.push({
    type: 'bkash',
    label: 'bKash',
    merchantNumber: config.payment.bkash.walletNumber,
    merchantName: config.payment.bkash.walletName
  });
}
if (config.payment.nagad?.walletNumber) {
  paymentMethods.push({
    type: 'nagad',
    label: 'Nagad',
    merchantNumber: config.payment.nagad.walletNumber,
    merchantName: config.payment.nagad.walletName
  });
}
if (config.payment.bank?.accountNumber) {
  paymentMethods.push({
    type: 'bank',
    label: 'Bank Transfer',
    bankName: config.payment.bank.bankName,
    accountNumber: config.payment.bank.accountNumber,
    accountName: config.payment.bank.accountName
  });
}
```

---

## Examples

### Example 1: Cash on Delivery (COD)

Simplest checkout - customer pays on delivery.

```json
{
  "deliveryAddress": {
    "addressLine1": "123 Main St, Dhanmondi",
    "city": "Dhaka",
    "phone": "01712345678"
  },
  "delivery": {
    "method": "standard",
    "price": 60
  },
  "paymentData": {
    "type": "cash"
  }
}
```

### Example 2: bKash Payment (Manual)

Customer pays to merchant's bKash first, then provides TrxID.

**Step 1:** Get merchant's bKash number from platform config:
```javascript
const config = await fetch('/api/v1/platform/config?select=payment');
const merchantBkash = config.data.payment.bkash.walletNumber; // "01712345678"
```

**Step 2:** Customer sends money to merchant's bKash and gets TrxID: `BGH3K5L90P`

**Step 3:** Submit order with TrxID:
```json
{
  "deliveryAddress": {
    "addressLine1": "123 Main St, Dhanmondi",
    "city": "Dhaka",
    "phone": "01712345678"
  },
  "delivery": {
    "method": "express",
    "price": 120
  },
  "paymentData": {
    "type": "bkash",
    "reference": "BGH3K5L90P",           // TrxID from bKash
    "senderPhone": "01712345678"         // Customer's bKash number
  },
  "couponCode": "SAVE10"
}
```

### Example 3: Bank Transfer

Customer transfers to merchant's bank account.

```json
{
  "deliveryAddress": {
    "addressLine1": "123 Main St, Dhanmondi",
    "city": "Dhaka",
    "phone": "01712345678"
  },
  "delivery": {
    "method": "standard",
    "price": 60
  },
  "paymentData": {
    "type": "bank",
    "reference": "FT2025120812345"       // Bank transaction reference
  }
}
```

### Example 4: Gift Order

Ordering on behalf of someone else (different recipient).

```json
{
  "deliveryAddress": {
    "recipientName": "John Doe",         // Gift recipient's name
    "addressLine1": "456 Park Ave",
    "city": "Chittagong",
    "phone": "01798765432"               // Gift recipient's phone
  },
  "delivery": {
    "method": "express",
    "price": 120
  },
  "paymentData": {
    "type": "bkash",
    "reference": "BGH3K5L90P",
    "senderPhone": "01712345678"         // Buyer's phone (payer)
  },
  "isGift": true,
  "notes": "Birthday gift - please include greeting card"
}
```

---

## Frontend Validation

```javascript
function validateCheckout(address, delivery, paymentData) {
  // Required fields
  if (!address?.addressLine1 || !address?.city || !address?.phone) {
    return 'Please provide complete delivery address';
  }
  if (!delivery?.method || delivery?.price === undefined) {
    return 'Please select a delivery method';
  }
  if (!paymentData?.type) {
    return 'Please select payment method';
  }

  // Phone validation
  const phoneRegex = /^01[0-9]{9}$/;
  if (!phoneRegex.test(address.phone)) {
    return 'Invalid phone number (use format: 01XXXXXXXXX)';
  }

  // Mobile wallet validation
  const walletMethods = ['bkash', 'nagad', 'rocket'];
  if (walletMethods.includes(paymentData.type)) {
    if (!paymentData.senderPhone || !phoneRegex.test(paymentData.senderPhone)) {
      return 'Please enter valid sender phone for mobile wallet';
    }
  }

  return null; // Valid
}
```

---

## Error Responses

```json
{
  "success": false,
  "message": "Error description"
}
```

| Status | Common Errors |
|--------|---------------|
| 400 | Validation errors, insufficient stock, invalid coupon |
| 401 | Not authenticated |
| 404 | Cart is empty |
| 500 | Server error |

---

## Payment Flow

All payments use **manual gateway** by default. The `paymentData` object only needs basic info from customers.

> **Note:** Advanced fields like `paymentDetails`, `gateway`, etc. are **library-managed** for automated payment gateways (Stripe, SSLCommerz, bKash API). Don't send these for manual payments.

### Option 1: Pay First (Mobile Wallets/Bank)

**Best for: bKash, Nagad, Rocket, Bank Transfer**

1. **Get merchant payment info** from platform config:
   ```javascript
   const config = await fetch('/api/v1/platform/config?select=payment');
   // Show merchant's bkash.walletNumber, bank.accountNumber, etc.
   ```

2. **Customer pays** to merchant's account and gets TrxID/reference

3. **Checkout form collects:**
   - Delivery address
   - Selected delivery method
   - Payment type + TrxID + sender phone

4. **Submit order** → Backend creates order with `status: pending`, `paymentStatus: pending`

5. **Admin verifies** payment in merchant panel → Order becomes `confirmed`

### Option 2: Cash on Delivery (COD)

**Best for: Local deliveries**

1. Customer selects "Cash" as payment method
2. Submit order → `status: pending`, `paymentStatus: pending`
3. Delivery person collects cash on delivery
4. Admin marks payment as verified → Order becomes `confirmed`

---

## Next Steps

After successful order creation:

1. **Clear local cart state** (backend clears cart automatically)
2. **Redirect to order confirmation page** with order ID
3. **Show order details** and payment instructions (if pending)
4. **Poll order status** every 30s: `GET /api/v1/orders/my/:id`

---

## TypeScript Types

```typescript
interface CreateOrderPayload {
  deliveryAddress: {
    recipientName?: string;           // For gift orders
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone: string;
  };
  delivery: {
    method: string;
    price: number;
    estimatedDays?: number;
  };
  paymentData?: {
    type: 'cash' | 'bkash' | 'nagad' | 'rocket' | 'bank' | 'card';
    reference?: string;               // Transaction ID (TrxID)
    senderPhone?: string;             // Required for mobile wallets
    // Note: gateway, paymentDetails are library-managed, don't send from FE
  };
  isGift?: boolean;                   // Gift order flag
  couponCode?: string;
  notes?: string;
}
```

Full types available at: `docs/.fe/types/order.types.ts`
