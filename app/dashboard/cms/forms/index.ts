/**
 * CMS Form Schemas Index
 * Maps page slugs to their form schemas
 */

import { homePageSchema } from "./home-page-schema";
import { faqsPageSchema } from "./faqs-page-schema";
import { contactPageSchema } from "./contact-page-schema";
import { privacyPageSchema } from "./privacy-page-schema";
import { returnsPageSchema } from "./returns-page-schema";
import { sizeGuidePageSchema } from "./size-guide-page-schema";
import { aboutPageSchema } from "./about-page-schema";
import { termsPageSchema } from "./terms-page-schema";
import { shippingPageSchema } from "./shipping-page-schema";

/**
 * Schema map - slug to form schema
 */
const schemaMap: Record<string, () => unknown> = {
  home: homePageSchema,
  faqs: faqsPageSchema,
  contact: contactPageSchema,
  "about-us": aboutPageSchema,
  "privacy-policy": privacyPageSchema,
  "terms-conditions": termsPageSchema,
  cookies: privacyPageSchema, // Uses same schema as privacy
  "returns-refunds": returnsPageSchema,
  "size-guide": sizeGuidePageSchema,
  "shipping-delivery": shippingPageSchema,
};

/**
 * Get form schema for a specific page
 */
export function getFormSchemaForPage(slug: string) {
  const schemaFn = schemaMap[slug];
  if (!schemaFn) {
    console.warn(`No form schema found for slug: ${slug}`);
    return null;
  }
  return schemaFn();
}

/**
 * Check if page has a specialized form
 */
export function hasSpecializedForm(slug: string): boolean {
  return slug in schemaMap;
}

export {
  homePageSchema,
  faqsPageSchema,
  contactPageSchema,
  privacyPageSchema,
  returnsPageSchema,
  sizeGuidePageSchema,
  aboutPageSchema,
  termsPageSchema,
  shippingPageSchema,
};
