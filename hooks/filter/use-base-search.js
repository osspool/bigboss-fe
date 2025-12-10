"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  buildFilterParams, 
  buildSearchParams, 
  clearSearchAndFilterParams, 
  getApiParams 
} from "@/lib/filter-utils";

/**
 * Base search hook that provides common search functionality
 * Can be extended by specific search hooks for different entities
 * Supports bracket syntax: field[operator]=value
 */
export function useBaseSearch(config) {
  const {
    basePath,
    searchFields = {},
    filterFields = {},
    defaultSearchType = Object.keys(searchFields)[0],
  } = config;

  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize search type from URL params
  const [searchType, setSearchType] = useState(() => {
    for (const [type, paramName] of Object.entries(searchFields)) {
      if (searchParams.has(paramName)) {
        return type;
      }
    }
    return defaultSearchType;
  });

  // Initialize search value from URL params
  const [searchValue, setSearchValue] = useState(() => {
    for (const paramName of Object.values(searchFields)) {
      const value = searchParams.get(paramName);
      if (value) return value;
    }
    return "";
  });

  // Initialize filter states
  const [filters, setFilters] = useState(() => {
    const initialFilters = {};
    Object.entries(filterFields).forEach(([key, config]) => {
      const paramValue = searchParams.get(config.paramName);
      if (paramValue) {
        if (config.type === 'array') {
          initialFilters[key] = paramValue.split(',');
        } else {
          initialFilters[key] = paramValue;
        }
      } else {
        initialFilters[key] = config.defaultValue || (config.type === 'array' ? [] : '');
      }
    });
    return initialFilters;
  });

  // Handle search submission
  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    
    // Clear existing search and filter params
    clearSearchAndFilterParams(params, config);
    
    // Add search params
    const searchParams_new = buildSearchParams(searchType, searchValue, searchFields);
    for (const [key, value] of searchParams_new) {
      params.set(key, value);
    }

    // Add filter params
    const filterParams = buildFilterParams(filters, filterFields);
    for (const [key, value] of filterParams) {
      params.set(key, value);
    }
    
    // Update URL
    router.push(`${basePath}?${params.toString()}`);
  }, [searchType, searchValue, filters, searchFields, filterFields, searchParams, router, basePath, config]);

  // Clear search and filters
  const clearSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    
    // Clear all search and filter params
    clearSearchAndFilterParams(params, config);
    
    // Reset state
    setSearchValue("");
    // Reset search type back to default for consistency
    setSearchType(defaultSearchType);
    const resetFilters = {};
    Object.entries(filterFields).forEach(([key, config]) => {
      resetFilters[key] = config.defaultValue || (config.type === 'array' ? [] : '');
    });
    setFilters(resetFilters);
    
    const next = params.toString();
    // If no params remain, navigate to clean basePath
    router.push(next ? `${basePath}?${next}` : `${basePath}`);
  }, [searchFields, filterFields, searchParams, router, basePath, config, defaultSearchType]);

  // Get current search params for API
  const getSearchParams = useCallback(() => {
    return getApiParams(searchParams);
  }, [searchParams]);

  // Update individual filter
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Check if there are active searches or filters
  const hasActiveSearch = Object.values(searchFields).some(paramName => {
    return searchParams.has(paramName);
  });
  
  const hasActiveFilters = Object.values(filterFields).some(config => {
    const baseField = config.paramName.replace(/\[.*\]$/, '');
    return searchParams.has(config.paramName) || 
           searchParams.has(`${baseField}[in]`) || 
           searchParams.has(baseField);
  });

  return {
    // Search state
    searchType,
    setSearchType,
    searchValue,
    setSearchValue,
    
    // Filter state
    filters,
    setFilters,
    updateFilter,
    
    // Actions
    handleSearch,
    clearSearch,
    getSearchParams,
    
    // Status
    hasActiveSearch,
    hasActiveFilters,
  };
} 