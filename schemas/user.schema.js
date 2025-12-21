import { z } from "zod";

/**
 * User role values
 */
export const USER_ROLE_VALUES = [
  'user',
  'admin',
  'superadmin',
  'finance-manager',
  'store-manager',
  'warehouse-staff'
];

/**
 * Branch role values
 */
export const BRANCH_ROLE_VALUES = [
  'branch_manager',
  'inventory_staff',
  'cashier',
  'stock_receiver',
  'stock_requester',
  'viewer'
];

/**
 * Branch assignment schema
 */
const branchAssignmentSchema = z.object({
  branchId: z.string().min(1, "Branch is required"),
  roles: z.array(z.enum(BRANCH_ROLE_VALUES)).optional().default([]),
  isPrimary: z.boolean().optional().default(false),
});

/**
 * User update schema (for admin editing)
 * Note: No create schema needed as per requirements
 */
export const userUpdateSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),

  email: z.string()
    .email("Invalid email address")
    .optional(),

  roles: z.array(z.enum(USER_ROLE_VALUES)).optional(),

  branches: z.array(branchAssignmentSchema).optional(),

  isActive: z.boolean().optional(),
});

/**
 * User view schema (for displaying user data)
 */
export const userViewSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string(),
  roles: z.array(z.enum(USER_ROLE_VALUES)),
  branches: z.array(z.object({
    branchId: z.string(),
    branchCode: z.string().optional(),
    branchName: z.string().optional(),
    branchRole: z.enum(['head_office', 'sub_branch']).optional(),
    roles: z.array(z.enum(BRANCH_ROLE_VALUES)),
    isPrimary: z.boolean(),
  })).optional().default([]),
  isActive: z.boolean(),
  lastLoginAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
