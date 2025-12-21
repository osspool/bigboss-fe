import { Info, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { field, section } from "@/components/form/form-system";
import { format } from "date-fns";

/**
 * Branch type options
 */
const BRANCH_TYPE_OPTIONS = [
  { value: "store", label: "Store" },
  { value: "warehouse", label: "Warehouse" },
  { value: "outlet", label: "Outlet" },
  { value: "franchise", label: "Franchise" },
];

/**
 * Create branch form schema
 * @param {Object} options - Schema options
 * @param {boolean} options.isEdit - Whether this is an edit form
 * @param {Object} options.branch - Existing branch (for edit mode)
 * @returns {Object} Form schema
 */
export const createBranchFormSchema = ({
  isEdit = false,
  branch = null,
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
                Branch code should be unique. Changing it may affect integrations.
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
          field.text("code", "Branch Code", {
            placeholder: "DHK-MAIN",
            description: "Unique identifier (uppercase, numbers, hyphens only)",
            required: true,
          }),
          field.text("name", "Branch Name", {
            placeholder: "Main Store Dhaka",
            required: true,
          }),
          field.select("type", "Branch Type", BRANCH_TYPE_OPTIONS, {
            placeholder: "Select type",
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
            placeholder: "+880 1XXXXXXXXX",
          }),
          field.text("email", "Email Address", {
            placeholder: "branch@example.com",
            type: "email",
          }),
          field.text("operatingHours", "Operating Hours", {
            placeholder: "Mon-Sat 9AM-9PM",
          }),
        ],
        { cols: 3 }
      ),

      // Address Section
      section(
        "address",
        "Address",
        [
          field.text("address.line1", "Address Line 1", {
            placeholder: "123 Main Street",
          }),
          field.text("address.line2", "Address Line 2", {
            placeholder: "Suite 456",
          }),
          field.text("address.city", "City", {
            placeholder: "Dhaka",
          }),
          field.text("address.state", "State/Division", {
            placeholder: "Dhaka Division",
          }),
          field.text("address.postalCode", "Postal Code", {
            placeholder: "1000",
          }),
          field.text("address.country", "Country", {
            placeholder: "Bangladesh",
          }),
        ],
        { cols: 2 }
      ),

      // Settings Section
      section(
        "settings",
        "Settings",
        [
          field.switch("isDefault", "Default Branch", {
            description: "Set this as the default branch for operations",
          }),
          ...(isEdit ? [
            field.switch("isActive", "Active Status", {
              description: "Inactive branches will not appear in branch selection",
            }),
          ] : []),
        ],
        { cols: 2 }
      ),

      // Read-only System Information (only when editing)
      ...(isEdit && branch ? [
        {
          id: "systemInfo",
          title: "System Information",
          render: () => (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Branch ID */}
                {branch._id && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Branch ID</label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono truncate">
                      {branch._id}
                    </div>
                  </div>
                )}

                {/* Slug */}
                {branch.slug && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Slug</label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono truncate">
                      {branch.slug}
                    </div>
                  </div>
                )}
              </div>

              {/* Timestamps */}
              {(branch.createdAt || branch.updatedAt) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {branch.createdAt && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created At
                      </label>
                      <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                        {format(new Date(branch.createdAt), 'PPp')}
                      </div>
                    </div>
                  )}
                  {branch.updatedAt && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Updated At
                      </label>
                      <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                        {format(new Date(branch.updatedAt), 'PPp')}
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
