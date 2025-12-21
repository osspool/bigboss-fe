# Platform API Guide

Singleton platform configuration API - stores all platform-wide settings in one document.

---

## Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/platform/config` | Public | Get platform config (supports field selection) |
| `PATCH` | `/api/v1/platform/config` | Admin | Update platform config |

---

## Get Platform Configuration

```http
GET /api/v1/platform/config
```

Returns full config or selected fields via query param.

**Field Selection:**
```http
GET /api/v1/platform/config?select=paymentMethods
GET /api/v1/platform/config?select=checkout,vat
GET /api/v1/platform/config?select=policies
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "platformName": "Big Boss Retail",
    "paymentMethods": [
      {
        "_id": "...",
        "type": "cash",
        "name": "Cash",
        "isActive": true
      },
      {
        "_id": "...",
        "type": "mfs",
        "provider": "bkash",
        "name": "bKash Personal",
        "walletNumber": "01712345678",
        "walletName": "Big Boss Store",
        "isActive": true
      },
      {
        "_id": "...",
        "type": "mfs",
        "provider": "nagad",
        "name": "Nagad Merchant",
        "walletNumber": "01812345678",
        "walletName": "Big Boss",
        "isActive": true
      },
      {
        "_id": "...",
        "type": "bank_transfer",
        "name": "DBBL Transfer",
        "bankName": "Dutch Bangla Bank",
        "accountNumber": "1234567890",
        "accountName": "Big Boss Ltd",
        "branchName": "Gulshan",
        "routingNumber": "090261234",
        "isActive": true
      },
      {
        "_id": "...",
        "type": "card",
        "name": "City Bank Cards",
        "bankName": "City Bank",
        "cardTypes": ["visa", "mastercard"],
        "note": "2% surcharge applies",
        "isActive": true
      }
    ],
    "checkout": {
      "allowStorePickup": true,
      "deliveryFeeSource": "static",
      "freeDeliveryThreshold": 2000,
      "deliveryZones": [
        { "name": "Inside Dhaka", "region": "dhaka", "price": 60, "estimatedDays": 2, "isActive": true },
        { "name": "Outside Dhaka", "region": "outside_dhaka", "price": 120, "estimatedDays": 5, "isActive": true }
      ]
    },
    "vat": {
      "isRegistered": true,
      "bin": "1234567890123",
      "defaultRate": 15,
      "pricesIncludeVat": true
    },
    "policies": {
      "refundPolicy": "...",
      "shippingPolicy": "..."
    }
  }
}
```

---

## Update Platform Configuration

```http
PATCH /api/v1/platform/config
Authorization: Bearer <admin_token>
```

Partial update - send only fields to update.

**Request:**
```json
{
  "platformName": "My Store",
  "paymentMethods": [
    { "type": "cash", "name": "Cash", "isActive": true },
    { "type": "mfs", "provider": "bkash", "name": "bKash", "walletNumber": "01712345678", "walletName": "My Store" }
  ],
  "checkout": {
    "deliveryZones": [
      { "name": "Dhaka City", "region": "dhaka", "price": 70, "estimatedDays": 1 }
    ]
  }
}
```

**Response:** Same shape as GET with updated values.

---

## Payment Methods

Flexible array supporting multiple accounts per type.

### Payment Types

| Type | Description | Required Fields |
|------|-------------|-----------------|
| `cash` | Cash on delivery / in-store | `name` |
| `mfs` | Mobile Financial Services | `name`, `provider`, `walletNumber` |
| `bank_transfer` | Bank account transfers | `name`, `bankName`, `accountNumber` |
| `card` | Credit/Debit cards | `name`, `bankName`, `cardTypes` |

### MFS Providers

- `bkash` - bKash
- `nagad` - Nagad
- `rocket` - Rocket
- `upay` - Upay

### Card Types

- `visa`
- `mastercard`
- `amex`
- `unionpay`
- `other`

### Payment Method Fields

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | `cash`, `mfs`, `bank_transfer`, `card` |
| `name` | string | Display name (e.g., "bKash Personal") |
| `provider` | string | MFS provider (bkash, nagad, etc.) |
| `walletNumber` | string | MFS wallet number |
| `walletName` | string | MFS wallet name |
| `bankName` | string | Bank name |
| `accountNumber` | string | Bank account number |
| `accountName` | string | Bank account holder name |
| `branchName` | string | Bank branch |
| `routingNumber` | string | Bank routing number |
| `cardTypes` | array | Card types accepted |
| `note` | string | Additional notes |
| `isActive` | boolean | Whether method is available |

---

## Delivery Zones

Static zone-based delivery pricing (in `checkout.deliveryZones`).

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Display name (e.g., "Inside Dhaka") |
| `region` | string | Region identifier |
| `price` | number | Delivery price in BDT |
| `estimatedDays` | number | Estimated delivery days |
| `isActive` | boolean | Whether zone is available |

---

## VAT Configuration

| Field | Type | Description |
|-------|------|-------------|
| `vat.isRegistered` | boolean | VAT registration status |
| `vat.bin` | string | Business Identification Number (13 digits) |
| `vat.registeredName` | string | Business name as registered |
| `vat.defaultRate` | number | Default VAT rate (%) |
| `vat.pricesIncludeVat` | boolean | Whether catalog prices include VAT |
| `vat.invoice.prefix` | string | Invoice number prefix |
| `vat.invoice.showVatBreakdown` | boolean | Show VAT on invoices |

---

## Frontend Usage

### Load Payment Methods for Checkout/POS

```javascript
const { data } = await fetch('/api/v1/platform/config?select=paymentMethods').then(r => r.json());

// Filter active methods
const activePayments = data.paymentMethods.filter(m => m.isActive);

// Group by type
const mfsMethods = activePayments.filter(m => m.type === 'mfs');
const bankMethods = activePayments.filter(m => m.type === 'bank_transfer');
const cardMethods = activePayments.filter(m => m.type === 'card');
```

### Load Delivery Options for Checkout

```javascript
const { data } = await fetch('/api/v1/platform/config?select=checkout').then(r => r.json());

// Get active zones
const zones = data.checkout.deliveryZones.filter(z => z.isActive);

// Check free delivery
const freeThreshold = data.checkout.freeDeliveryThreshold;
const deliveryCharge = subtotal >= freeThreshold ? 0 : selectedZone.price;
```

### Admin - Add Payment Method

```javascript
// Get current config
const { data: config } = await fetch('/api/v1/platform/config?select=paymentMethods').then(r => r.json());

// Add new method
const updated = [...config.paymentMethods, {
  type: 'mfs',
  provider: 'nagad',
  name: 'Nagad Business',
  walletNumber: '01912345678',
  walletName: 'Shop Name',
  isActive: true,
}];

// Update
await fetch('/api/v1/platform/config', {
  method: 'PATCH',
  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ paymentMethods: updated }),
});
```

---

## Notes

- **Singleton:** Only one platform config document exists; auto-created with defaults if missing.
- **Field Selection:** Use `?select=field1,field2` to fetch only needed fields.
- **Payment Methods:** Multiple accounts per type supported (e.g., multiple bKash numbers).
- **Delivery Zones:** Simple zone-based pricing. For courier API pricing, set `checkout.deliveryFeeSource: 'provider'`.
