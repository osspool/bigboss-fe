import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { field, section } from "@/components/form/form-system";
import { format } from "date-fns";

// Supplier type options
const SUPPLIER_TYPE_OPTIONS = [
  { value: "local", label: "Local" },
  { value: "import", label: "Import" },
  { value: "manufacturer", label: "Manufacturer" },
  { value: "wholesaler", label: "Wholesaler" },
];

// Payment terms options
const PAYMENT_TERMS_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "credit", label: "Credit" },
];

/**
 * Create supplier form schema
 * @param {Object} options - Schema options
 * @param {boolean} options.isEdit - Whether this is an edit form
 * @param {Object} options.supplier - Existing supplier (for edit mode)
 * @returns {Object} Form schema
 */
export const createSupplierFormSchema = ({
  isEdit = false,
  supplier = null,
}) => {
  return {
    sections: [
      // Alert for edit mode
      ...(isEdit ? [
        {
          id: "alert",
          render: () => (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Supplier code is auto-generated and cannot be modified. Deactivating a supplier will preserve audit history.
              </AlertDescription>
            </Alert>
          ),
        },
      ] : []),

      // Basic Information Section
      section(
        "basic",
        "Basic Information",
        [
          field.text("name", "Supplier Name", {
            placeholder: "ABC Supplier",
            required: true,
          }),
          field.select("type", "Supplier Type", SUPPLIER_TYPE_OPTIONS, {
            placeholder: "Select type",
          }),
          field.text("contactPerson", "Contact Person", {
            placeholder: "John Doe",
          }),
        ],
        { cols: 3 }
      ),

      // Contact Information Section
      section(
        "contact",
        "Contact Information",
        [
          field.text("phone", "Phone Number", {
            placeholder: "01712345678",
          }),
          field.text("email", "Email Address", {
            placeholder: "supplier@example.com",
            type: "email",
          }),
          field.text("taxId", "Tax ID / BIN", {
            placeholder: "Tax identification number",
          }),
        ],
        { cols: 3 }
      ),

      // Address Section
      section(
        "address",
        "Address",
        [
          field.textarea("address", "Full Address", {
            placeholder: "Enter supplier address",
            rows: 3,
          }),
        ],
        { cols: 1 }
      ),

      // Payment Terms Section
      section(
        "payment",
        "Payment Terms",
        [
          field.select("paymentTerms", "Payment Terms", PAYMENT_TERMS_OPTIONS, {
            placeholder: "Select payment terms",
          }),
          field.number("creditDays", "Credit Days", {
            placeholder: "15",
            min: 0,
            max: 365,
          }),
          field.number("creditLimit", "Credit Limit (BDT)", {
            placeholder: "50000",
            min: 0,
          }),
          field.number("openingBalance", "Opening Balance (BDT)", {
            placeholder: "0",
            min: 0,
          }),
        ],
        { cols: 4 }
      ),

      // Notes Section
      section(
        "notes",
        "Additional Information",
        [
          field.textarea("notes", "Notes", {
            placeholder: "Internal notes about this supplier",
            rows: 3,
          }),
        ],
        { cols: 1 }
      ),

      // Status Section
      section(
        "status",
        "Status",
        [
          field.switch("isActive", "Active", {
            description: "Inactive suppliers cannot be used for new purchases",
          }),
        ],
        { cols: 1 }
      ),

      // Read-only System Information (only when editing)
      ...(isEdit && supplier ? [
        {
          id: "systemInfo",
          title: "System Information",
          render: () => (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Supplier ID */}
                {supplier._id && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Supplier ID</label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono truncate">
                      {supplier._id}
                    </div>
                  </div>
                )}

                {/* Supplier Code */}
                {supplier.code && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Supplier Code</label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono">
                      {supplier.code}
                    </div>
                  </div>
                )}
              </div>

              {/* Timestamps */}
              {(supplier.createdAt || supplier.updatedAt) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {supplier.createdAt && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Created At</label>
                      <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                        {format(new Date(supplier.createdAt), 'PPp')}
                      </div>
                    </div>
                  )}
                  {supplier.updatedAt && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                      <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                        {format(new Date(supplier.updatedAt), 'PPp')}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ),
        },
      ] : []),
    ],
  };
};
