import { z } from "zod";

/**
 * Size Definition Schema
 */
const sizeDefinitionSchema = z.object({
  name: z.string()
    .min(1, "Size name is required")
    .max(20, "Size name must be less than 20 characters"),
  measurements: z.record(z.string(), z.string()).optional().default({}),
});

/**
 * Size Guide create schema
 */
export const sizeGuideCreateSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),

  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),

  measurementUnit: z.enum(["inches", "cm"]).optional().default("inches"),

  measurementLabels: z.array(z.string().max(50))
    .max(10, "Maximum 10 measurement labels allowed")
    .optional()
    .default([]),

  sizes: z.array(sizeDefinitionSchema)
    .optional()
    .default([]),

  note: z.string()
    .max(1000, "Note must be less than 1000 characters")
    .optional()
    .or(z.literal("")),

  displayOrder: z.coerce.number()
    .int("Display order must be an integer")
    .min(0, "Display order must be 0 or greater")
    .optional()
    .default(0),

  isActive: z.boolean().optional().default(true),
});

/**
 * Size Guide update schema
 */
export const sizeGuideUpdateSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),

  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),

  measurementUnit: z.enum(["inches", "cm"]).optional(),

  measurementLabels: z.array(z.string().max(50))
    .max(10, "Maximum 10 measurement labels allowed")
    .optional(),

  sizes: z.array(sizeDefinitionSchema).optional(),

  note: z.string()
    .max(1000, "Note must be less than 1000 characters")
    .optional()
    .or(z.literal("")),

  displayOrder: z.coerce.number()
    .int("Display order must be an integer")
    .min(0, "Display order must be 0 or greater")
    .optional(),

  isActive: z.boolean().optional(),
});

/**
 * Size Guide view schema (for displaying size guide data)
 */
export const sizeGuideViewSchema = z.object({
  _id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  measurementUnit: z.enum(["inches", "cm"]),
  measurementLabels: z.array(z.string()),
  sizes: z.array(sizeDefinitionSchema),
  note: z.string().optional(),
  isActive: z.boolean(),
  displayOrder: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
