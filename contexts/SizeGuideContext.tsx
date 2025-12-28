"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useSizeGuides } from "@/hooks/query/useSizeGuides";
import type { SizeGuide } from "@/types/size-guide.types";
import type { SizeTableData } from "@/data/constants";

interface SizeGuideContextValue {
  /** All size guides from API */
  sizeGuides: SizeGuide[];
  /** Loading state */
  isLoading: boolean;
  /** Get a size guide by ID */
  getSizeGuideById: (id: string) => SizeGuide | undefined;
  /** Get a size guide by slug */
  getSizeGuideBySlug: (slug: string) => SizeGuide | undefined;
  /** Transform API SizeGuide to SizeTableData format for rendering */
  toTableData: (sizeGuide: SizeGuide) => SizeTableData;
  /** Transform multiple size guides to SizeTableData array */
  toTableDataArray: (sizeGuides: SizeGuide[]) => SizeTableData[];
}

const SizeGuideContext = createContext<SizeGuideContextValue | null>(null);

interface SizeGuideProviderProps {
  children: ReactNode;
  /** Optional token for authenticated requests (null for public) */
  token?: string | null;
}

/**
 * Transform API SizeGuide to SizeTableData format for SizeTable component
 */
function transformToTableData(sizeGuide: SizeGuide): SizeTableData {
  // Build headers: "Size" + measurement labels
  const headers = ["Size", ...sizeGuide.measurementLabels];

  // Build rows: each size becomes a row
  const rows = sizeGuide.sizes.map(size => {
    // First column is the size name
    const row = [size.name];

    // Add measurement values in order of labels
    sizeGuide.measurementLabels.forEach(label => {
      // Convert label to key format (lowercase, replace spaces with underscore)
      const key = label.toLowerCase().replace(/\s+/g, "_");
      row.push(size.measurements[key] || "-");
    });

    return row;
  });

  return {
    category: sizeGuide.name,
    description: sizeGuide.note || sizeGuide.description || `All measurements are in ${sizeGuide.measurementUnit}.`,
    headers,
    rows,
  };
}

export function SizeGuideProvider({ children, token = null }: SizeGuideProviderProps) {
  // Fetch all active size guides with caching (30 min stale time from hook)
  const { items: sizeGuides = [], isLoading } = useSizeGuides(
    token,
    { limit: 50, isActive: true, sort: "displayOrder" },
    { public: true }
  );

  const value = useMemo<SizeGuideContextValue>(() => ({
    sizeGuides,
    isLoading,

    getSizeGuideById: (id: string) => {
      return sizeGuides.find((sg: SizeGuide) => sg._id === id);
    },

    getSizeGuideBySlug: (slug: string) => {
      return sizeGuides.find((sg: SizeGuide) => sg.slug === slug);
    },

    toTableData: transformToTableData,

    toTableDataArray: (guides: SizeGuide[]) => {
      return guides.map(transformToTableData);
    },
  }), [sizeGuides, isLoading]);

  return (
    <SizeGuideContext.Provider value={value}>
      {children}
    </SizeGuideContext.Provider>
  );
}

/**
 * Hook to access size guide context
 * Must be used within SizeGuideProvider
 */
export function useSizeGuideContext() {
  const context = useContext(SizeGuideContext);
  if (!context) {
    throw new Error("useSizeGuideContext must be used within SizeGuideProvider");
  }
  return context;
}

/**
 * Hook to get a specific size guide by ID
 * Provides loading state and transformed table data
 */
export function useProductSizeGuide(sizeGuideId: string | null | undefined) {
  const { getSizeGuideById, toTableData, isLoading } = useSizeGuideContext();

  return useMemo(() => {
    if (!sizeGuideId) {
      return { sizeGuide: null, tableData: null, isLoading };
    }

    const sizeGuide = getSizeGuideById(sizeGuideId);
    const tableData = sizeGuide ? toTableData(sizeGuide) : null;

    return { sizeGuide, tableData, isLoading };
  }, [sizeGuideId, getSizeGuideById, toTableData, isLoading]);
}
