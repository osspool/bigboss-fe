# Types Documentation

This directory contains all TypeScript type definitions for the application, organized by domain for better maintainability and developer experience.

## 📁 Structure

```
types/
├── index.ts              # Barrel export (re-exports all types)
├── common.types.ts       # Shared/common types used across modules
├── product.types.ts      # Product-related types
├── cart.types.ts         # Shopping cart types
├── order.types.ts        # Order and delivery types
├── payment.types.ts      # Payment gateway and transaction types
├── review.types.ts       # Product review types
├── coupon.types.ts       # Discount coupon types
├── filter.types.ts       # Product filtering and sorting types
└── cms.types.ts          # Content Management System types
```

## 🎯 Design Principles

### 1. **Domain-Driven Organization**
Types are organized by business domain (product, cart, order, etc.) rather than technical patterns. This makes it easier to:
- Find related types quickly
- Understand business logic
- Reduce merge conflicts in teams
- Scale the codebase

### 2. **Comprehensive Documentation**
Each type includes:
- JSDoc comments explaining its purpose
- Usage examples where appropriate
- Field descriptions for clarity
- Related types cross-referenced

### 3. **Type Safety & Validation**
- All types are strictly typed
- Enums and unions for constrained values
- Optional vs required fields clearly marked
- Discriminated unions where applicable

### 4. **API-Aligned**
Types match the backend API contracts to ensure type safety across the stack.

## 📖 Usage Guide

### Importing Types

#### Option 1: Barrel Import (Convenient)
```typescript
import { Product, Cart, Order } from '@/types';
```

#### Option 2: Direct Import (Better Tree-Shaking)
```typescript
import { Product } from '@/types/product.types';
import { Cart } from '@/types/cart.types';
```

### Common Patterns

#### Working with Products
```typescript
import { Product, ProductCreateInput, ProductCardData } from '@/types';

// Full product detail
const product: Product = await fetchProduct(id);

// Creating a product
const newProduct: ProductCreateInput = {
  name: "Premium Headphones",
  shortDescription: "High-quality wireless headphones",
  category: "electronics",
  basePrice: 299,
  quantity: 50,
  // ... other fields
};

// Product card display (minimal data)
const cardData: ProductCardData = {
  _id: product._id,
  slug: product.slug,
  name: product.name,
  basePrice: product.basePrice,
  currentPrice: product.currentPrice,
  featuredImage: product.featuredImage,
  // ... minimal fields for grid display
};
```

#### Working with Cart
```typescript
import { Cart, CartItem, AddToCartPayload } from '@/types';

// Add to cart
const payload: AddToCartPayload = {
  productId: "123",
  quantity: 2,
  variations: [
    {
      name: "Size",
      option: { value: "Medium" }
    }
  ]
};

// Cart item
const item: CartItem = {
  _id: "cart-item-1",
  product: { /* populated product data */ },
  variations: [{ name: "Size", option: { value: "Medium" } }],
  quantity: 2
};
```

#### Working with Orders
```typescript
import { Order, CreateOrderPayload, OrderStatus } from '@/types';

// Creating an order
const orderPayload: CreateOrderPayload = {
  items: [/* cart items */],
  deliveryAddress: {
    addressLine1: "123 Main St",
    city: "Dhaka",
    phone: "+880123456789"
  },
  deliveryOptionId: "standard",
  paymentMethod: "bkash"
};

// Order status update
const status: OrderStatus = "confirmed";
```

## 🔄 Type Relationships

```
Product
  ├── ProductImage (extends Image)
  ├── ProductVariation
  │   └── VariationOption
  ├── ProductDiscount (extends Discount)
  └── ProductStats (extends Stats)

Cart
  ├── CartItem
  │   ├── CartProduct (partial Product)
  │   └── CartItemVariation
  └── CartSummary

Order
  ├── OrderItem
  ├── DeliveryAddress
  ├── DeliveryOption
  └── OrderStatus
```

## 🚀 Migration Guide

### From Old Monolithic Structure
If you have existing imports from the old `types/index.ts`:

**Before:**
```typescript
// Old monolithic file had everything in one place
import { Product, Cart, Order } from '@/types';
```

**After:**
```typescript
// Still works! Barrel export provides backward compatibility
import { Product, Cart, Order } from '@/types';

// Or use direct imports for better tree-shaking
import { Product } from '@/types/product.types';
import { Cart } from '@/types/cart.types';
import { Order } from '@/types/order.types';
```

### Common Migration Issues

#### 1. **CartVariation → CartItemVariation**
```typescript
// ❌ Old
import { CartVariation } from '@/types';

// ✅ New
import { CartItemVariation } from '@/types';
```

#### 2. **Generic Image Type**
```typescript
// ❌ Old - Product-specific image everywhere
import { ProductImage } from '@/types';

// ✅ New - Use generic Image for reusability
import { Image } from '@/types/common.types';
// Or use ProductImage alias if product-specific
import { ProductImage } from '@/types/product.types';
```

## 📚 Type Categories

### Common Types (`common.types.ts`)
Foundation types used across multiple domains:
- `Image` - Generic image structure
- `Discount` - Generic discount structure
- `Stats` - Generic statistics
- `PaginationInfo` - Pagination metadata
- `ApiResponse<T>` - Generic API response wrapper

### Product Types (`product.types.ts`)
Everything related to products:
- `Product` - Complete product model
- `ProductVariation` - Product variations (Size, Color, etc.)
- `ProductCreateInput` / `ProductUpdateInput` - Form payloads
- `ProductCardData` - Minimal data for product cards

### Cart Types (`cart.types.ts`)
Shopping cart functionality:
- `Cart` - User's shopping cart
- `CartItem` - Individual cart item
- `CartSummary` - Cart totals and calculations
- `AddToCartPayload` - Add to cart request

### Order Types (`order.types.ts`)
Order management:
- `Order` - Complete order structure
- `OrderStatus` - Order lifecycle states
- `DeliveryAddress` - Shipping address
- `CreateOrderPayload` - Order creation request

### Payment Types (`payment.types.ts`)
Payment processing:
- `PaymentGateway` - Available gateways
- `ManualPaymentMethod` - Manual payment options
- `PaymentData` - Payment transaction details
- `Refund` - Refund requests

### Review Types (`review.types.ts`)
Product reviews:
- `Review` - Product review structure
- `ReviewSummary` - Aggregated rating statistics
- `CreateReviewPayload` - Review submission

### Coupon Types (`coupon.types.ts`)
Promotional codes:
- `Coupon` - Discount coupon structure
- `CouponValidationResult` - Validation response
- `ApplyCouponPayload` - Apply coupon request

### Filter Types (`filter.types.ts`)
Product filtering and search:
- `ProductFilterState` - Complete filter state
- `SortOption` - Sorting options
- `ProductSearchParams` - Search query parameters
- `FacetedSearchResults<T>` - Search with facets

### CMS Types (`cms.types.ts`)
Content management:
- `CMSPage<T>` - Generic page structure
- `CMSMetadata` - SEO metadata
- `NavigationMenu` - Site navigation
- `FooterConfig` - Footer configuration

## 🛠️ Best Practices

### 1. **Use Specific Types**
```typescript
// ✅ Good - specific input type
function createProduct(data: ProductCreateInput): Promise<Product> {
  // ...
}

// ❌ Bad - too generic
function createProduct(data: any): Promise<any> {
  // ...
}
```

### 2. **Leverage Type Utilities**
```typescript
// Pick specific fields
type ProductPreview = Pick<Product, '_id' | 'name' | 'slug' | 'featuredImage'>;

// Make all fields optional
type PartialProduct = Partial<Product>;

// Omit system fields
type ProductInput = Omit<Product, '_id' | 'slug' | 'createdAt' | 'updatedAt'>;
```

### 3. **Document Custom Types**
```typescript
/**
 * Extended product with computed discount percentage
 */
interface ProductWithDiscount extends Product {
  /** Computed discount percentage (0-100) */
  discountPercentage: number;
}
```

### 4. **Use Enums for Constants**
```typescript
// ✅ Type-safe with autocomplete
const status: OrderStatus = "confirmed";

// ❌ Prone to typos
const status = "confirmd"; // typo!
```

## 🔍 Finding Types

Use your IDE's "Go to Definition" (F12 in VS Code) or search:

```bash
# Find all product-related types
grep -r "export.*Product" types/

# Find usage of a specific type
grep -r "CartItem" components/
```

## 🤝 Contributing

When adding new types:

1. **Choose the right module** - Put types in the domain they belong to
2. **Document everything** - Add JSDoc comments
3. **Keep it DRY** - Extend common types when possible
4. **Update this README** - Add examples for new patterns
5. **Export from barrel** - Add to `index.ts` for easy access

## 📝 Notes

- All types are exported as `type` (not `interface export`) for better tree-shaking
- Timestamps are ISO 8601 strings (not Date objects) to match API
- Optional fields use `?:` syntax for clarity
- System-managed fields are clearly documented as read-only

---

**Need help?** Check the inline documentation in each type file or ask the team! 🚀
