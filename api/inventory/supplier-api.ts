// @/api/inventory/supplier-api.ts
import { BaseApi } from "../api-factory";
import type {
  Supplier,
  SupplierCreatePayload,
  SupplierUpdatePayload,
  SupplierQueryParams,
} from "@/types/supplier.types";

/**
 * Supplier (Vendor) API
 *
 * Base path: /api/v1/inventory/suppliers
 *
 * Standard CRUD (inherited from BaseApi):
 * - getAll({ token, params }) - list with filtering/search/pagination
 * - getById({ token, id }) - get by ID
 * - create({ token, data }) - create supplier
 * - update({ token, id, data }) - update supplier
 * - delete({ token, id }) - deactivate supplier (soft delete)
 */
class SupplierApi extends BaseApi<Supplier, SupplierCreatePayload, SupplierUpdatePayload> {
  constructor(config = {}) {
    super("inventory/suppliers", config);
  }
}

export const supplierApi = new SupplierApi();
export { SupplierApi };
export type { SupplierQueryParams };
