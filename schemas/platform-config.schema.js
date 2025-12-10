import { z } from 'zod';

/**
 * Platform Config Schema
 * Matches backend schema from platform.plugin.js
 */

// Wallet details schema (bkash, nagad, rocket)
const walletDetailsSchema = z.object({
  walletNumber: z.string().optional().or(z.literal('')),
  walletName: z.string().optional().or(z.literal('')),
  note: z.string().optional().or(z.literal('')),
});

// Bank details schema
const bankDetailsSchema = z.object({
  bankName: z.string().optional().or(z.literal('')),
  accountNumber: z.string().optional().or(z.literal('')),
  accountName: z.string().optional().or(z.literal('')),
  branchName: z.string().optional().or(z.literal('')),
  routingNumber: z.string().optional().or(z.literal('')),
  swiftCode: z.string().optional().or(z.literal('')),
  note: z.string().optional().or(z.literal('')),
});

// Cash payment schema
const cashPaymentSchema = z.object({
  enabled: z.boolean().default(true),
});

// Policies schema
const policiesSchema = z.object({
  termsAndConditions: z.string().optional().or(z.literal('')),
  privacyPolicy: z.string().optional().or(z.literal('')),
  refundPolicy: z.string().optional().or(z.literal('')),
  shippingPolicy: z.string().optional().or(z.literal('')),
});

// Delivery option schema
const deliveryOptionSchema = z.object({
  _id: z.string().optional(), // for existing options
  name: z.string().min(1, 'Delivery name is required'),
  region: z.string().min(1, 'Region is required'),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  estimatedDays: z.coerce.number().min(0, 'Estimated days must be 0 or greater').optional(),
  isActive: z.boolean().default(true),
});

// Main platform config schema
export const platformConfigSchema = z.object({
  platformName: z.string().min(1, 'Platform name is required').optional(),
  payment: z.object({
    cash: cashPaymentSchema.optional(),
    bkash: walletDetailsSchema.optional(),
    nagad: walletDetailsSchema.optional(),
    rocket: walletDetailsSchema.optional(),
    bank: bankDetailsSchema.optional(),
  }).optional(),
  deliveryOptions: z.array(deliveryOptionSchema).optional(),
  policies: policiesSchema.optional(),
});

export default platformConfigSchema;
