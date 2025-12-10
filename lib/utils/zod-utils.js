import { z } from "zod";

// Preprocess: accept Date or YYYY-MM-DD string and coerce to ISO datetime string
const preprocessToIso = (val) => {
  if (!val) return val;
  if (val instanceof Date) return val.toISOString();
  if (typeof val === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const d = new Date(val);
      return isNaN(d.getTime()) ? val : d.toISOString();
    }
  }
  return val;
};

export const coerceToIsoDateTimeString = z.preprocess(
  preprocessToIso,
  z.string().datetime().optional()
);

export const coerceToIsoDateTimeStringRequired = z.preprocess(
  preprocessToIso,
  z.string().datetime()
);

// ObjectId string (24 hex chars)
export const objectIdStringSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/i, "Invalid ObjectId string");

// Accept empty string and coerce to undefined for optional ObjectId fields
export const optionalObjectIdString = z.preprocess((val) => {
  if (val === '' || val === null) return undefined;
  return val;
}, objectIdStringSchema.optional());


