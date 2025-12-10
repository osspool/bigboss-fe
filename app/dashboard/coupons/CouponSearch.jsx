"use client";

import * as Search from "@/components/shared/search";
import { useCouponSearch } from "@/hooks/filter/use-coupon-search";
import SelectInput from "@/components/form/form-utils/select-input";

const SEARCH_TYPE_OPTIONS = [
  { value: "code", label: "Coupon Code" },
];

const DISCOUNT_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "percentage", label: "Percentage (%)" },
  { value: "fixed", label: "Fixed Amount (৳)" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export function CouponSearch() {
  const searchHook = useCouponSearch();

  return (
    <Search.Root hook={searchHook}>
      <Search.Container>
        <Search.TypeInput
          placeholder="Search coupons by code..."
          searchTypeOptions={SEARCH_TYPE_OPTIONS}
        />

        <Search.Filters title="Coupon Filters">
          <SelectInput
            label="Discount Type"
            items={DISCOUNT_TYPE_OPTIONS}
            value={searchHook.discountType}
            onValueChange={searchHook.setDiscountType}
            placeholder="All Types"
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
