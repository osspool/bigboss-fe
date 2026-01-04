"use client";

import { Search, DateRangeFilter, SelectInput } from "@classytic/clarity";
import { ORDER_STATUS_OPTIONS, ORDER_SOURCE_OPTIONS, PAYMENT_STATUS_OPTIONS } from "@/constants/enums/monetization.enum";
import { useOrderSearch } from "@/hooks/filter/use-order-search";

export function OrdersSearch() {
  const searchHook = useOrderSearch();

  const parseYmd = (value) => {
    if (!value) return undefined;
    const parts = value.split("-");
    if (parts.length !== 3) return undefined;
    const [y, m, d] = parts.map(Number);
    const date = new Date(y, (m || 1) - 1, d || 1);
    return Number.isNaN(date.getTime()) ? undefined : date;
  };

  const searchTypeOptions = [
    { value: "_id", label: "Order ID" },
    { value: "customerPhone", label: "Customer Phone" },
  ];

  return (
    <Search.Root hook={searchHook}>
      <Search.Container>
        <Search.TypeInput
          placeholder="Search orders..."
          searchTypeOptions={searchTypeOptions}
          showClearButton={true}
        />

        <Search.Filters title="Order Filters">
          <SelectInput
            label="Status"
            items={ORDER_STATUS_OPTIONS}
            value={searchHook.status}
            onValueChange={searchHook.setStatus}
            placeholder="All"
          />
          <SelectInput
            label="Source"
            items={ORDER_SOURCE_OPTIONS}
            value={searchHook.source}
            onValueChange={searchHook.setSource}
            placeholder="All"
          />
          <SelectInput
            label="Payment"
            items={PAYMENT_STATUS_OPTIONS}
            value={searchHook.paymentStatus}
            onValueChange={searchHook.setPaymentStatus}
            placeholder="All"
          />
          <DateRangeFilter
            label="Date Range"
            compact
            initialStartDate={parseYmd(searchHook.dateFrom)}
            initialEndDate={parseYmd(searchHook.dateTo)}
            onFilter={searchHook.applyDateRange}
            onClear={searchHook.clearDateRange}
          />
        </Search.Filters>

        <Search.Actions />
      </Search.Container>
    </Search.Root>
  );
}


