"use client";

import * as Search from "@/components/shared/search";
import { useUserSearch } from "@/hooks/filter/use-user-search";
import SelectInput from "@/components/form/form-utils/select-input";
import { USER_ROLE_OPTIONS, STATUS_OPTIONS } from "@/components/platform/user/form/user-form-schema";

const SEARCH_TYPE_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "email", label: "Email" },
];

export function UserSearch() {
  const searchHook = useUserSearch();

  return (
    <Search.Root hook={searchHook}>
      <Search.Container>
        <Search.TypeInput
          placeholder="Search users..."
          searchTypeOptions={SEARCH_TYPE_OPTIONS}
        />

        <Search.Filters title="User Filters">
          <SelectInput
            label="Role"
            items={[{ value: "", label: "All Roles" }, ...USER_ROLE_OPTIONS]}
            value={searchHook.roles}
            onValueChange={searchHook.setRoles}
            placeholder="All Roles"
          />
          <SelectInput
            label="Status"
            items={[{ value: "", label: "All" }, ...STATUS_OPTIONS]}
            value={searchHook.isActive}
            onValueChange={searchHook.setIsActive}
            placeholder="All"
          />
        </Search.Filters>

        <Search.Actions />
      </Search.Container>
    </Search.Root>
  );
}
