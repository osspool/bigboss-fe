/**
 * Composable Search Component System
 *
 * @example
 * ```jsx
 * import { Search } from "@/components/shared/search";
 *
 * function MySearch() {
 *   const searchHook = useMySearch();
 *
 *   return (
 *     <Search.Root hook={searchHook}>
 *       <Search.Container>
 *         <Search.Input placeholder="Search..." />
 *         <Search.Filters>
 *           <SelectInput ... />
 *           <TagChoiceInput ... />
 *         </Search.Filters>
 *         <Search.Actions />
 *       </Search.Container>
 *     </Search.Root>
 *   );
 * }
 * ```
 */

export { SearchRoot as Root } from "./search-root";
export { SearchInput as Input } from "./search-input";
export { SearchTypeInput as TypeInput } from "./search-type-input";
export { SearchFilters as Filters } from "./search-filters";
export { SearchActions as Actions } from "./search-actions";
export { SearchContainer as Container } from "./search-container";
export { SearchFilterActions as FilterActions } from "./search-filter-actions";
export { useSearch } from "./search-context";
