"use client";

import * as Search from "@/components/shared/search";
import { useCustomerSearch } from "@/hooks/filter/use-customer-search";
import SelectInput from "@/components/form/form-utils/select-input";
import { GENDER_OPTIONS } from "@/data/constants";

const SEARCH_TYPE_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
];

export function CustomerSearch() {
  const searchHook = useCustomerSearch();

  return (
    <Search.Root hook={searchHook}>
      <Search.Container>
        <Search.TypeInput
          placeholder="Search customers..."
          searchTypeOptions={SEARCH_TYPE_OPTIONS}
        />

        <Search.Filters title="Customer Filters">
          <SelectInput
            label="Gender"
            items={[{ value: "", label: "All" }, ...GENDER_OPTIONS]}
            value={searchHook.gender}
            onValueChange={searchHook.setGender}
            placeholder="All"
          />
        </Search.Filters>

        <Search.Actions />
      </Search.Container>
    </Search.Root>
  );
}
