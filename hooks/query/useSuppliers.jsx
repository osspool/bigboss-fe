import { supplierApi } from '@/api/inventory/supplier-api';
import { createCrudHooks } from '@/hooks/factories';

// Create standard CRUD hooks
const { KEYS, useList, useDetail, useActions, useNavigation } = createCrudHooks({
  api: supplierApi,
  entityKey: 'suppliers',
  singular: 'Supplier',
  plural: 'Suppliers',
  defaults: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    messages: {
      createSuccess: "Supplier created successfully",
      updateSuccess: "Supplier updated successfully",
      deleteSuccess: "Supplier deactivated successfully",
    },
  },
});

// Export standard hooks
export {
  KEYS as SUPPLIER_KEYS,
  useList as useSuppliers,
  useDetail as useSupplierDetail,
  useActions as useSupplierActions,
  useNavigation as useSupplierNavigation,
};
