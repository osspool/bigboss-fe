/**
 * Logistics Utilities
 *
 * Wrapper utilities for @classytic/bd-areas package.
 * Use logisticsApi.calculateCharge() for actual delivery charges from provider.
 *
 * @example
 * import { searchAreas, getArea } from '@/lib/logistics-utils';
 *
 * // Search areas
 * const areas = searchAreas('mohammadpur');
 *
 * // Get area by internalId
 * const area = getArea(1206);
 *
 * // Build area selection for checkout
 * const selection = buildAreaSelection(area);
 */

import {
  getDivisions,
  getDistrictsByDivision,
  getDistrictById,
  getAllDistricts,
  getAreasByDistrict,
  getArea,
  getAllAreas,
  searchAreas as bdSearchAreas,
  resolveArea as bdResolveArea,
} from '@classytic/bd-areas';

import type {
  Division,
  District,
  Area,
  AreaResolved,
  ProviderAreaIds,
} from '@classytic/bd-areas';

// Re-export types
export type { Division, District, Area, AreaResolved, ProviderAreaIds };

// Re-export core functions
export {
  getDivisions,
  getDistrictsByDivision,
  getDistrictById,
  getAllDistricts,
  getAreasByDistrict,
  getArea,
  getAllAreas,
};

// ==================== Zone Names ====================

/**
 * Zone names for display (zoneId 1-6)
 */
export const ZONE_NAMES: Record<number, string> = {
  1: 'Dhaka Metro',
  2: 'Dhaka Suburb',
  3: 'Chittagong Metro',
  4: 'Other Metro',
  5: 'Zonal',
  6: 'Remote',
};

export function getZoneName(zoneId: number): string {
  return ZONE_NAMES[zoneId] || 'Standard';
}

// ==================== Area Search ====================

/**
 * Search areas by name, postCode, district, or division
 */
export function searchAreas(query: string, limit = 20): Area[] {
  return bdSearchAreas(query, limit);
}

/**
 * Search areas with zone name included
 */
export function searchAreasEnhanced(
  query: string,
  limit = 20
): Array<Area & { zoneName: string }> {
  const results = bdSearchAreas(query, limit);
  return results.map(area => ({
    ...area,
    zoneName: getZoneName(area.zoneId),
  }));
}

/**
 * Get popular areas (Dhaka metro) for quick selection
 */
export function getPopularAreas(limit = 50): Array<Area & { zoneName: string }> {
  const dhakaAreas = getAreasByDistrict('dhaka').slice(0, limit);
  return dhakaAreas.map(area => ({
    ...area,
    zoneName: getZoneName(area.zoneId),
  }));
}

// ==================== Area Resolution ====================

/**
 * Resolve area with full division/district objects
 */
export function resolveArea(internalId: number): AreaResolved | null {
  return bdResolveArea(internalId) || null;
}

// ==================== Division/District Options ====================

/**
 * Get divisions as options for dropdown
 */
export function getDivisionOptions(): Array<{ value: string; label: string; labelLocal: string }> {
  return getDivisions().map(d => ({
    value: d.id,
    label: d.name,
    labelLocal: d.nameLocal,
  }));
}

/**
 * Get districts for a division as options
 */
export function getDistrictOptions(divisionId: string): Array<{ value: string; label: string }> {
  const districts = getDistrictsByDivision(divisionId);
  return districts.map(d => ({
    value: d.id,
    label: d.name,
  }));
}

// ==================== Area Selection Builder ====================

/**
 * Area selection result for forms and checkout
 */
export interface AreaSelection {
  /** Internal area ID (from @classytic/bd-areas) */
  areaId: number;
  /** Area display name */
  areaName: string;
  /** Zone ID for pricing (1-6) */
  zoneId: number;
  /** Zone display name */
  zoneName: string;
  /** District name */
  city: string;
  /** Division name */
  division: string;
  /** Postal code */
  postalCode?: string;
  /** Provider-specific area IDs */
  providerAreaIds: ProviderAreaIds;
}

/**
 * Build AreaSelection from Area object
 * Use this when user selects an area from the dropdown
 */
export function buildAreaSelection(area: Area): AreaSelection {
  return {
    areaId: area.internalId,
    areaName: area.name,
    zoneId: area.zoneId,
    zoneName: getZoneName(area.zoneId),
    city: area.districtName,
    division: area.divisionName,
    postalCode: area.postCode ? String(area.postCode) : undefined,
    providerAreaIds: area.providers,
  };
}

/**
 * Get AreaSelection from internalId
 */
export function getAreaSelection(internalId: number): AreaSelection | null {
  const area = getArea(internalId);
  if (!area) return null;
  return buildAreaSelection(area);
}
