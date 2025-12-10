"use client";

import { createContext, useContext, useState } from "react";

const SearchContext = createContext(undefined);

export function SearchProvider({ children, value }) {
  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within SearchProvider");
  }
  return context;
}
