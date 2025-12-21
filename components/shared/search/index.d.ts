import type { ReactNode, InputHTMLAttributes, KeyboardEvent } from "react";

// Base search hook interface that all search hooks should extend
export interface BaseSearchHook {
  searchValue: string;
  setSearchValue: (value: string) => void;
  handleSearch?: () => void;
  clearSearch?: () => void;
  hasActiveFilters?: boolean;
  hasActiveSearch?: boolean;
  [key: string]: unknown;
}

// Root component props
interface SearchRootProps {
  children: ReactNode;
  hook: BaseSearchHook;
  className?: string;
}

// Container props
interface SearchContainerProps {
  children: ReactNode;
  className?: string;
}

// Input props
interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onKeyDown"> {
  placeholder?: string;
  showClearButton?: boolean;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
}

// Type input props
interface SearchTypeOption {
  value: string;
  label: string;
}

interface SearchTypeInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onKeyDown"> {
  placeholder?: string;
  searchTypeOptions?: SearchTypeOption[];
  showClearButton?: boolean;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
}

// Filters props
interface SearchFiltersProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

// Actions props
interface SearchActionsProps {
  className?: string;
  showSearch?: boolean;
  showClear?: boolean;
  searchLabel?: string;
  clearLabel?: string;
}

// Filter actions props
interface SearchFilterActionsProps {
  className?: string;
  showSearch?: boolean;
  showClear?: boolean;
  showReset?: boolean;
  searchLabel?: string;
  clearLabel?: string;
  resetLabel?: string;
  onReset?: () => void;
}

// Component exports
export declare const Root: React.FC<SearchRootProps>;
export declare const Input: React.FC<SearchInputProps>;
export declare const TypeInput: React.FC<SearchTypeInputProps>;
export declare const Filters: React.FC<SearchFiltersProps>;
export declare const Actions: React.FC<SearchActionsProps>;
export declare const Container: React.FC<SearchContainerProps>;
export declare const FilterActions: React.FC<SearchFilterActionsProps>;

// Hook export
export declare function useSearch<T extends BaseSearchHook>(): T;
