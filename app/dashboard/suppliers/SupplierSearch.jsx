"use client";

import { Search, SelectInput } from "@classytic/clarity";
import { useSupplierSearch } from "@/hooks/filter/use-supplier-search";

const SEARCH_TYPE_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "code", label: "Code" },
];

const SUPPLIER_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "local", label: "Local" },
  { value: "import", label: "Import" },
  { value: "manufacturer", label: "Manufacturer" },
  { value: "wholesaler", label: "Wholesaler" },
];

const PAYMENT_TERMS_OPTIONS = [
  { value: "", label: "All Terms" },
  { value: "cash", label: "Cash" },
  { value: "credit", label: "Credit" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export function SupplierSearch() {
  const searchHook = useSupplierSearch();

  return (
    <Search.Root hook={searchHook}>
      <Search.Container>
        <Search.TypeInput
          placeholder="Search suppliers..."
          searchTypeOptions={SEARCH_TYPE_OPTIONS}
        />

        <Search.Filters title="Supplier Filters">
          <SelectInput
            label="Type"
            items={SUPPLIER_TYPE_OPTIONS}
            value={searchHook.type}
            onValueChange={searchHook.setType}
            placeholder="All Types"
          />
          <SelectInput
            label="Payment Terms"
            items={PAYMENT_TERMS_OPTIONS}
            value={searchHook.paymentTerms}
            onValueChange={searchHook.setPaymentTerms}
            placeholder="All Terms"
          />
          <SelectInput
            label="Status"
            items={STATUS_OPTIONS}
            value={searchHook.isActive}
            onValueChange={searchHook.setIsActive}
            placeholder="All Status"
          />
        </Search.Filters>

        <Search.Actions />
      </Search.Container>
    </Search.Root>
  );
}
