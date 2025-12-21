import { z } from "zod";

/**
 * Category Image Schema
 */
const categoryImageSchema = z.object({
  url: z.string().url("Invalid image URL").optional().or(z.literal("")),
  alt: z.string().max(200, "Alt text must be less than 200 characters").optional(),
});

/**
 * Category SEO Schema
 */
const categorySeoSchema = z.object({
  title: z.string().max(60, "SEO title should be under 60 characters").optional(),
  description: z.string().max(160, "SEO description should be under 160 characters").optional(),
  keywords: z.array(z.string()).optional().default([]),
});

/**
 * Category create schema
 */
export const categoryCreateSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),

  // Parent category slug (optional - null for root categories)
  parent: z.string()
    .optional()
    .nullable()
    .or(z.literal("")),

  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),

  image: categoryImageSchema.optional(),

  displayOrder: z.coerce.number()
    .int("Display order must be an integer")
    .min(0, "Display order must be 0 or greater")
    .optional()
    .default(0),

  vatRate: z.coerce.number()
    .min(0, "VAT rate must be 0 or greater")
    .max(100, "VAT rate must be 100 or less")
    .optional()
    .nullable(),

  isActive: z.boolean().optional().default(true),

  seo: categorySeoSchema.optional(),
});

/**
 * Category update schema
 */
export const categoryUpdateSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),

  // Note: slug cannot be changed after creation

  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),

  image: categoryImageSchema.optional(),

  displayOrder: z.coerce.number()
    .int("Display order must be an integer")
    .min(0, "Display order must be 0 or greater")
    .optional(),

  vatRate: z.coerce.number()
    .min(0, "VAT rate must be 0 or greater")
    .max(100, "VAT rate must be 100 or less")
    .optional()
    .nullable(),

  isActive: z.boolean().optional(),

  seo: categorySeoSchema.optional(),
});

/**
 * Category view schema (for displaying category data)
 */
export const categoryViewSchema = z.object({
  _id: z.string(),
  name: z.string(),
  slug: z.string(),
  parent: z.string().nullable().optional(),
  description: z.string().optional(),
  image: categoryImageSchema.optional(),
  displayOrder: z.number().optional(),
  vatRate: z.number().nullable().optional(),
  isActive: z.boolean(),
  productCount: z.number().optional(),
  seo: categorySeoSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  // Virtuals
  fullPath: z.string().optional(),
  isRoot: z.boolean().optional(),
});
