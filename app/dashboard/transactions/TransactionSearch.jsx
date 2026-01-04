"use client";

import { Search, SelectInput, DateRangeFilter } from "@classytic/clarity";
import { useTransactionSearch } from "@/hooks/filter/use-transaction-search";
import { TRANSACTION_CATEGORY_OPTIONS, TRANSACTION_TYPE_OPTIONS } from "@/constants/enums/monetization.enum";

export function TransactionSearch() {
  const searchHook = useTransactionSearch();

  const parseYmd = (s) => {
    if (!s) return undefined;
    const parts = s.split('-');
    if (parts.length !== 3) return undefined;
    const [y, m, d] = parts.map(Number);
    const dt = new Date(y, (m || 1) - 1, d || 1);
    return isNaN(dt.getTime()) ? undefined : dt;
  };

  return (
    <Search.Root hook={searchHook}>
      <Search.Container>
        <Search.Input placeholder="Search transaction id..." />

        <Search.Filters title="Transaction Filters">
          <SelectInput
            label="Type"
            items={[{ value: "", label: "All" }, ...TRANSACTION_TYPE_OPTIONS]}
            value={searchHook.type}
            onValueChange={searchHook.setType}
            placeholder="All"
          />
          <SelectInput
            label="Category"
            items={[{ value: "", label: "All" }, ...TRANSACTION_CATEGORY_OPTIONS]}
            value={searchHook.category}
            onValueChange={searchHook.setCategory}
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
