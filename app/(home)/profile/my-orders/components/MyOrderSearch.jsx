"use client";

import { Search, SelectInput } from "@classytic/clarity";
import { useMyOrderSearch } from "@/hooks/filter/use-my-order-search";

const SEARCH_TYPE_OPTIONS = [
  { value: "orderId", label: "Order ID" },
  { value: "customerPhone", label: "Phone" },
  { value: "customerEmail", label: "Email" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export function MyOrderSearch() {
  const searchHook = useMyOrderSearch();

  return (
    <Search.Root hook={searchHook}>
      <Search.Container>
        <Search.TypeInput
          placeholder="Search by order ID..."
          searchTypeOptions={SEARCH_TYPE_OPTIONS}
        />

        <Search.Filters title="Order Filters">
          <SelectInput
            label="Status"
            items={STATUS_OPTIONS}
            value={searchHook.status}
            onValueChange={searchHook.setStatus}
            placeholder="All"
          />
        </Search.Filters>

        <Search.Actions />
      </Search.Container>
    </Search.Root>
  );
}
