/**
 * Application Routes and Link Suggestions
 * Used for CMS link fields to provide auto-suggestions
 */

import { PREDEFINED_CMS_PAGES } from "./cms-pages.js";

/**
 * Common internal routes for auto-suggestions
 */
export const COMMON_ROUTES = [
  { value: "/", label: "Home" },
  { value: "/products", label: "All Products" },
  { value: "/products?tags=new-arrivals", label: "New Arrivals" },
  { value: "/products?tags=sale", label: "Sale Items" },
  { value: "/products?tags=featured", label: "Featured Products" },
  { value: "/products?style=street", label: "Street Style" },
  { value: "/products?style=casual", label: "Casual Style" },
  { value: "/products?style=urban", label: "Urban Style" },
  { value: "/cart", label: "Shopping Cart" },
  { value: "/checkout", label: "Checkout" },
] as const;

/**
 * CMS page routes from predefined pages
 */
export const CMS_PAGE_ROUTES = PREDEFINED_CMS_PAGES.map((page) => ({
  value: page.route,
  label: page.name,
}));

/**
 * All available routes for link suggestions
 */
export const ALL_ROUTES = [...COMMON_ROUTES, ...CMS_PAGE_ROUTES];

/**
 * External link suggestions
 */
export const EXTERNAL_LINKS = [
  { value: "https://instagram.com/bigboss.bd", label: "Instagram" },
  { value: "https://facebook.com/bigbossbd", label: "Facebook" },
  { value: "https://twitter.com/bigboss_bd", label: "Twitter" },
] as const;

/**
 * Helper to get route suggestion by category
 */
export function getRouteSuggestions(category?: "internal" | "external" | "all") {
  switch (category) {
    case "internal":
      return ALL_ROUTES;
    case "external":
      return EXTERNAL_LINKS;
    case "all":
    default:
      return [...ALL_ROUTES, ...EXTERNAL_LINKS];
  }
}
