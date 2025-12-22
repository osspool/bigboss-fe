import { Info, Calendar, Shield, Building2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { field, section } from "@/components/form/form-system";
import { format } from "date-fns";

/**
 * User role options for select input
 */
export const USER_ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "superadmin", label: "Super Admin" },
  { value: "finance-admin", label: "Finance Admin" },
  { value: "finance-manager", label: "Finance Manager" },
  { value: "store-manager", label: "Store Manager" },
  { value: "warehouse-admin", label: "Warehouse Admin" },
  { value: "warehouse-staff", label: "Warehouse Staff" },
];

/**
 * Branch role options for select input
 */
export const BRANCH_ROLE_OPTIONS = [
  { value: "branch_manager", label: "Branch Manager" },
  { value: "inventory_staff", label: "Inventory Staff" },
  { value: "cashier", label: "Cashier" },
  { value: "stock_receiver", label: "Stock Receiver" },
  { value: "stock_requester", label: "Stock Requester" },
  { value: "viewer", label: "Viewer" },
];

/**
 * Status options for active/inactive
 */
export const STATUS_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

/**
 * Create user form schema
 * @param {Object} options - Schema options
 * @param {Object} options.user - Existing user (for edit mode)
 * @returns {Object} Form schema
 */
export const createUserFormSchema = ({ user = null }) => {
  return {
    sections: [
      // Alert for edit mode
      {
        id: "alert",
        render: () => (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You can update user details and roles. Password changes must be done through a separate process.
            </AlertDescription>
          </Alert>
        ),
      },

      // Basic Information Section
      section(
        "basic",
        "Basic Information",
        [
          field.text("name", "Full Name", {
            placeholder: "John Doe",
            required: true,
          }),
          field.text("email", "Email Address", {
            placeholder: "john@example.com",
            type: "email",
            required: true,
          }),
        ],
        { cols: 2 }
      ),

      // Roles Section
      section(
        "roles",
        "System Roles",
        [
          field.multiselect("roles", "Roles", USER_ROLE_OPTIONS, {
            placeholder: "Select roles",
          }),
        ],
        { cols: 1 }
      ),

      // Status Section
      section(
        "status",
        "Account Status",
        [
          field.switch("isActive", "Active", {
            description: "Deactivating will prevent user from logging in",
          }),
        ],
        { cols: 1 }
      ),

      // Branch Assignments Section (custom render - handled by form component)
      {
        id: "branchAssignments",
        title: "Branch Assignments",
        customRender: true, // Flag to indicate this needs custom rendering
      },

      // Read-only System Information
      ...(user ? [
        {
          id: "systemInfo",
          title: "System Information",
          render: () => (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* User ID */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">User ID</label>
                  <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono truncate">
                    {user._id}
                  </div>
                </div>

                {/* Last Login */}
                {user.lastLoginAt && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Last Login</label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                      {format(new Date(user.lastLoginAt), 'PPp')}
                    </div>
                  </div>
                )}
              </div>

              {/* Branch Assignments */}
              {user.branches && user.branches.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Branch Assignments
                  </h4>
                  <div className="space-y-2">
                    {user.branches.map((branch, index) => (
                      <div key={branch.branchId || index} className="p-3 border rounded-md bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            {branch.branchName || branch.branchCode || branch.branchId}
                          </span>
                          {branch.isPrimary && (
                            <Badge variant="secondary" className="text-xs">Primary</Badge>
                          )}
                        </div>
                        {branch.roles && branch.roles.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {branch.roles.map((role) => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {role.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              {(user.createdAt || user.updatedAt) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {user.createdAt && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Created At</label>
                      <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                        {format(new Date(user.createdAt), 'PPp')}
                      </div>
                    </div>
                  )}
                  {user.updatedAt && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                      <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                        {format(new Date(user.updatedAt), 'PPp')}
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
