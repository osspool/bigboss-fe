# POS (Point of Sale) Module

## Architecture Overview

### Layout Structure
The POS uses a fixed-height layout with internal scrolling panels to prevent page-level scrolling.

```
POS Page (absolute inset-0)
├── PageHeader (fixed)
└── PosClient (flex-1, overflow-hidden)
    └── ResponsiveSplitLayout (h-full)
        ├── ProductsPanel (left, scrollable products)
        └── CartPanel (right, scrollable cart + fixed checkout)
```

### Height Constraint Chain
```
page.tsx
  └── absolute inset-0           // Fills parent container
      └── overflow-hidden         // Prevents page scroll
          └── PosClient (h-full)
              └── ResponsiveSplitLayout (h-full)
                  ├── ProductsPanel
                  │   ├── Fixed: Search & Filters
                  │   └── Scrollable: Products Grid (flex-1 overflow-y-auto min-h-0)
                  └── CartPanel
                      ├── Scrollable: Cart Items & Details (flex-1 overflow-y-auto min-h-0)
                      └── Fixed: Checkout Button
```

## Key Principles

### 1. No Page-Level Scrolling
- POS page uses `absolute inset-0` to fill container
- `overflow-hidden` on wrapper prevents body scroll
- Individual panels handle their own scrolling

### 2. Flexbox Height Management
- Use `flex-1 min-h-0` on scrollable containers
- `min-h-0` is critical - prevents flex items from overflowing
- Parent must have defined height (h-full, h-svh, or absolute positioning)

### 3. Fixed + Scrollable Pattern
```tsx
<div className="h-full flex flex-col">
  {/* Fixed sections at top */}
  <div>Search, filters, etc.</div>

  {/* Scrollable content */}
  <div className="flex-1 overflow-y-auto min-h-0">
    {/* Content */}
  </div>

  {/* Fixed sections at bottom */}
  <div>Actions, buttons, etc.</div>
</div>
```

## Components

### PosClient.tsx
Main orchestrator component that:
- Manages all state (cart, customer, payment, products)
- Coordinates between panels
- Handles business logic for checkout

**State Management:**
- `usePosCart` - Cart items, discounts
- `usePosCustomer` - Customer selection, membership lookup
- `usePosPayment` - Payment methods, split payments
- `usePosProducts` - Product search, barcode lookup

### ProductsPanel.tsx
**Structure:**
- Fixed: Search bar & barcode scanner
- Fixed: Category filter buttons
- Scrollable: Products grid

**Features:**
- Deferred search for performance
- Barcode lookup integration
- Variant selector for configurable products

### CartPanel.tsx
**Structure:**
- Scrollable: Cart items, summary, customer, discount, payment
- Fixed: Checkout button (always visible)

**Features:**
- Split payment support
- Membership points redemption
- Tier-based discounts
- Dynamic payment validation

## Responsive Behavior

### Desktop (>= 1024px)
- Uses `ResponsiveSplitLayout` with `desktopVariant="fixed"`
- Left panel: Flexible width
- Right panel: Fixed 380px width
- Border divider between panels

### Mobile (< 1024px)
- Uses `mobileVariant="tabs"`
- Tab navigation between Products and Cart
- Full-width single panel view

## Performance Optimizations

1. **Deferred Search** - `useDeferredValue` prevents re-renders during typing
2. **Memoized Calculations** - Order totals, view models computed with `useMemo`
3. **Component Memoization** - ProductsPanel, CartPanel use `memo()`
4. **Callback Stability** - Handlers use `useCallback` to prevent re-renders

## State Flow

```
User Action → PosClient Handler → Update Hook State → Recompute Totals → Update UI
```

Example: Adding to cart
```
ProductCard onClick
  → PosClient.cart.addToCart()
  → usePosCart updates items
  → calculateOrderTotals() recomputes
  → CartPanel re-renders with new data
```

## Common Issues & Solutions

### Issue: Page scrolls instead of panels
**Solution:** Check height constraint chain:
1. Root page uses `absolute inset-0` or fixed height
2. Wrapper has `overflow-hidden`
3. Panels use `flex-1 min-h-0` for scrollable sections

### Issue: Cart not scrolling
**Solution:** Ensure:
1. Parent has `h-full flex flex-col`
2. Scrollable section has `flex-1 overflow-y-auto min-h-0`
3. No `h-full` on content inside scrollable area

### Issue: Layout breaks on mobile
**Solution:**
- Use `ResponsiveSplitLayout` with proper breakpoints
- Test with `forceMobile` prop during development

## Best Practices

1. **Always maintain height chain** - Every parent in the chain needs defined height
2. **Use min-h-0 on flex children** - Prevents overflow bugs
3. **Separate fixed and scrollable sections** - Clear visual hierarchy
4. **Test with real content volume** - Long product lists, many cart items
5. **Don't modify shadcn components** - Use wrapper components instead

## File Structure

```
feature/pos/
├── dashboard/
│   ├── PosClient.tsx              # Main orchestrator
│   ├── components/
│   │   ├── ProductsPanel.tsx      # Left panel - products
│   │   ├── CartPanel.tsx          # Right panel - cart
│   │   ├── ReceiptPanel.tsx       # Post-checkout receipt
│   │   ├── ProductCard.tsx        # Individual product
│   │   ├── VariantSelectorDialog.tsx
│   │   ├── CustomerLookupDialog.tsx
│   │   ├── CustomerQuickAddDialog.tsx
│   │   └── cart/                  # Cart sub-components
│   │       ├── CartItems.tsx
│   │       ├── CartSummary.tsx
│   │       ├── CustomerSection.tsx
│   │       ├── DiscountSection.tsx
│   │       ├── PaymentSection.tsx
│   │       └── PointsRedemptionSection.tsx
│   └── pos-payment.ts             # Payment logic
├── hooks/
│   ├── usePosCart.ts              # Cart state
│   ├── usePosCustomer.ts          # Customer state
│   └── usePosPayment.ts           # Payment state
└── utils/
    └── index.ts                   # Helper functions
```

## Testing Checklist

- [ ] Products load and display correctly
- [ ] Search filters products
- [ ] Barcode scan adds to cart
- [ ] Cart scrolls independently
- [ ] Products grid scrolls independently
- [ ] Page doesn't scroll
- [ ] Checkout button always visible
- [ ] Mobile tabs switch properly
- [ ] Split payment validation works
- [ ] Membership lookup functions
- [ ] Receipt displays after checkout
- [ ] Layout works on different screen sizes
- [ ] No console errors
- [ ] Performance is smooth with 100+ products
