# Search Component System

A composable, reusable search component system built with React best practices, following the shadcn/radix UI pattern.

## Features

- ✨ **Composable Architecture** - Build search UIs with modular, reusable components
- 📱 **Mobile-First** - Automatic mobile optimization with sheet-based filters
- 🎯 **Type-Safe** - Full TypeScript support (when migrated)
- 🔄 **URL State Management** - Automatic URL param synchronization
- 🎨 **Fully Customizable** - Override any component or style
- ♿ **Accessible** - Built on Radix UI primitives

## Quick Start

### 1. Create a Search Hook

```jsx
// hooks/use-my-search.js
import { useBaseSearch } from "@/hooks/filter/use-base-search";

export function useMySearch() {
  return useBaseSearch({
    basePath: "/my-page",
    searchFields: {
      search: "search", // Simple search: ?search=text
    },
    filterFields: {
      category: {
        paramName: "category[in]",
        type: "array",
        defaultValue: [],
      },
      status: {
        paramName: "status",
        type: "string",
        defaultValue: "",
      },
    },
    defaultSearchType: "search",
  });
}
```

### 2. Build Your Search UI

```jsx
// components/MySearch.jsx
import * as Search from "@/components/shared/search";
import { CategoryFilter, SelectFilter } from "@/components/shared/search/filters";
import { useMySearch } from "@/hooks/use-my-search";

export function MySearch() {
  const searchHook = useMySearch();

  return (
    <Search.Root hook={searchHook}>
      <Search.Container>
        <Search.Input placeholder="Search..." />

        <Search.Filters title="Filters">
          <CategoryFilter
            name="category"
            label="Category"
            options={CATEGORY_OPTIONS}
          />
          <SelectFilter
            name="status"
            label="Status"
            options={STATUS_OPTIONS}
          />
        </Search.Filters>

        <Search.Actions />
      </Search.Container>
    </Search.Root>
  );
}
```

## Components

### Core Components

#### `<Search.Root>`
Container component that provides search context to all children.

```jsx
<Search.Root hook={useMySearch()} className="...">
  {children}
</Search.Root>
```

#### `<Search.Container>`
Responsive flexbox container for search input and actions.

```jsx
<Search.Container className="...">
  {children}
</Search.Container>
```

#### `<Search.Input>`
Search input field with built-in clear button.

```jsx
<Search.Input
  placeholder="Search..."
  showIcon={true}
  showClearButton={true}
/>
```

#### `<Search.Filters>`
Filter button with popover (desktop) or sheet (mobile).

```jsx
<Search.Filters title="Filters" description="Refine your results">
  {/* Your filter components */}
</Search.Filters>
```

#### `<Search.Actions>`
Search and Clear action buttons.

```jsx
<Search.Actions
  showSearchButton={true}
  showClearButton={true}
  searchButtonText="Search" // Optional, defaults to icon only on mobile
/>
```

### Filter Components

Pre-built filter components that auto-connect to search context:

#### `<CategoryFilter>`
Multi-select tag filter for categories/tags.

```jsx
<CategoryFilter
  name="category"
  label="Categories"
  options={CATEGORY_OPTIONS}
  placeholder="Select categories"
/>
```

#### `<SelectFilter>`
Single-select dropdown filter.

```jsx
<SelectFilter
  name="status"
  label="Status"
  options={STATUS_OPTIONS}
  placeholder="All"
/>
```

#### `<RangeFilter>`
Numeric range filter (min/max).

```jsx
<RangeFilter
  minName="minPrice"
  maxName="maxPrice"
  label="Price Range"
  minPlaceholder="0"
  maxPlaceholder="Any"
/>
```

#### `<FilterGroup>`
Group related filters together.

```jsx
<FilterGroup title="Price">
  <RangeFilter ... />
</FilterGroup>
```

## Advanced Usage

### Custom Filter Components

Create custom filters using the `useSearch` hook:

```jsx
import { useSearch } from "@/components/shared/search";
import { MyCustomInput } from "./MyCustomInput";

function CustomFilter() {
  const { filters, updateFilter } = useSearch();

  return (
    <MyCustomInput
      value={filters.myField}
      onChange={(value) => updateFilter("myField", value)}
    />
  );
}
```

### Mobile Customization

The system automatically uses sheets on mobile (< 768px). Customize behavior:

```jsx
import { useIsMobile } from "@/hooks/use-mobile";

function MyComponent() {
  const isMobile = useIsMobile();

  return isMobile ? <MobileView /> : <DesktopView />;
}
```

### URL Parameter Mapping

The search hook automatically maps filter fields to URL parameters:

```js
filterFields: {
  category: {
    paramName: "category[in]",  // URL: ?category[in]=tech,design
    type: "array",
    defaultValue: [],
  },
  minPrice: {
    paramName: "price[gte]",    // URL: ?price[gte]=100
    type: "number",
    defaultValue: "",
  },
}
```

## Real-World Examples

### Course Search

See: [CoursesSearch.jsx](../../../features/courses/components/CoursesSearch.jsx)

```jsx
<Search.Root hook={useCourseSearch()}>
  <Search.Container>
    <Search.Input placeholder="Search courses..." />
    <Search.Filters>
      <CategoryFilter name="category" options={CATEGORIES} />
      <CategoryFilter name="level" options={LEVELS} />
      <SelectFilter name="monetizationType" options={TYPES} />
      <RangeFilter minName="minPrice" maxName="maxPrice" />
    </Search.Filters>
    <Search.Actions />
  </Search.Container>
</Search.Root>
```

### Order Search

See: [OrdersSearch.jsx](../../../app/dashboard/platform/orders/OrdersSearch.jsx)

```jsx
<Search.Root hook={useOrderSearch()}>
  <Search.Container>
    <Search.Input placeholder="Search orders..." />
    <Search.Filters>
      <SelectInput label="Status" ... />
      <SelectInput label="Payment" ... />
      <DateRangeFilter label="Date Range" ... />
    </Search.Filters>
    <Search.Actions />
  </Search.Container>
</Search.Root>
```

## API Reference

### Search Hook Return Value

```js
{
  // Search state
  searchType: string,
  setSearchType: (type: string) => void,
  searchValue: string,
  setSearchValue: (value: string) => void,

  // Filter state
  filters: object,
  updateFilter: (key: string, value: any) => void,

  // Actions
  handleSearch: () => void,
  clearSearch: () => void,

  // Status
  hasActiveSearch: boolean,
  hasActiveFilters: boolean,
}
```

## Benefits Over Old System

### Before (BaseSearch)
```jsx
// ❌ Props drilling nightmare
<BaseSearch
  searchType={searchType}
  setSearchType={setSearchType}
  searchValue={searchValue}
  setSearchValue={setSearchValue}
  searchOptions={searchOptions}
  filters={filters}
  onFilterChange={onFilterChange}
  filterComponents={[
    ({ filters, onFilterChange, disabled }) => (
      <div>
        <TagChoiceInput
          value={filters?.category ?? []}
          onValueChange={(v) => onFilterChange?.("category", v)}
        />
      </div>
    )
  ]}
  onSearch={onSearch}
  onClear={onClear}
  hasActiveSearch={hasActiveSearch}
  hasActiveFilters={hasActiveFilters}
  searchPlaceholder="..."
/>
```

### After (New System)
```jsx
// ✅ Clean, composable, readable
<Search.Root hook={useMySearch()}>
  <Search.Container>
    <Search.Input placeholder="..." />
    <Search.Filters>
      <CategoryFilter name="category" options={OPTIONS} />
    </Search.Filters>
    <Search.Actions />
  </Search.Container>
</Search.Root>
```

## Architecture Benefits

1. **Separation of Concerns** - Logic (hook) separated from UI (components)
2. **Component Composition** - Build complex UIs from simple parts
3. **Context API** - No prop drilling, cleaner code
4. **Reusability** - Share filters across different searches
5. **Testability** - Test hooks and components independently
6. **Type Safety** - Easy to add TypeScript later
7. **Developer Experience** - Intuitive, self-documenting API

## Migration Guide

To migrate from old `BaseSearch` to new system:

1. Keep your existing search hook (e.g., `useCourseSearch`)
2. Replace `<BaseSearch>` with `<Search.Root>`
3. Use `<Search.Container>` for layout
4. Replace filter render props with component-based filters
5. Use pre-built filter components or create custom ones

That's it! The hook layer remains unchanged.
