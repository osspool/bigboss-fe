import { GENDER_OPTIONS } from "@/data/constants";
import { useMemo, useState } from "react";
import { Info, Calendar, User, Award, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { field, section } from "@/components/form/form-system";
import { format } from "date-fns";
import { AddressManager } from "./AddressManager";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomerMembership } from "@/hooks/query/useCustomers";

/**
 * Create customer form schema
 * @param {Object} options - Schema options
 * @param {boolean} options.isEdit - Whether this is an edit form
 * @param {Object} options.customer - Existing customer (for edit mode)
 * @param {string} options.token - Auth token
 * @returns {Object} Form schema
 */
export const createCustomerFormSchema = ({
  isEdit = false,
  customer = null,
  token = "",
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
                System-managed fields (User ID, Stats) are read-only and automatically maintained by the system.
              </AlertDescription>
            </Alert>
          ),
        },
      ] : []),

      // Basic Information Section
      section(
        "basic",
        "Contact Information",
        [
          field.text("name", "Full Name", {
            placeholder: "John Doe",
            required: true,
          }),
          field.text("phone", "Phone Number", {
            placeholder: "+447700900000",
            required: true,
          }),
          field.text("email", "Email Address", {
            placeholder: "john@example.com",
            type: "email",
          }),
        ],
        { cols: 3 }
      ),

      // Personal Information Section
      section(
        "personal",
        "Personal Information",
        [
          field.date("dateOfBirth", "Date of Birth", {
            placeholder: "Select date",
          }),
          field.select("gender", "Gender", GENDER_OPTIONS, {
            placeholder: "Select gender",
          }),
        ],
        { cols: 2 }
      ),

      // Addresses Section
      {
        id: "addresses",
        render: ({ control, disabled }) => (
          <AddressManager control={control} disabled={disabled} />
        ),
      },

      // Membership Section (only when editing)
      ...(isEdit && customer ? [
        {
          id: "membership",
          title: "Membership",
          render: () => (
            <MembershipManager customer={customer} token={token} />
          ),
        },
      ] : []),

      // Read-only System Information (only when editing)
      ...(isEdit && customer ? [
        {
          id: "systemInfo",
          title: "System Information",
          render: () => (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* User ID */}
                {customer.userId && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">User ID</label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono truncate">
                      {customer.userId}
                    </div>
                  </div>
                )}

                {/* Customer ID */}
                {customer._id && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Customer ID</label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono truncate">
                      {customer._id}
                    </div>
                  </div>
                )}
              </div>

              {/* Stats Section */}
              {customer.stats && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer Statistics
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Orders */}
                    {customer.stats.orders && (
                      <div className="space-y-2 p-3 border rounded-md bg-muted/30">
                        <label className="text-xs font-medium text-muted-foreground">Orders</label>
                        <div className="space-y-1">
                          <div className="text-sm">Total: {customer.stats.orders.total || 0}</div>
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            <div>Completed: {customer.stats.orders.completed || 0}</div>
                            <div>Cancelled: {customer.stats.orders.cancelled || 0}</div>
                            <div>Refunded: {customer.stats.orders.refunded || 0}</div>
                            <div>No Show: {customer.stats.orders.noShow || 0}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Revenue (convert pence to pounds) */}
                    {customer.stats.revenue && (
                      <div className="space-y-2 p-3 border rounded-md bg-muted/30">
                        <label className="text-xs font-medium text-muted-foreground">Revenue</label>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            ৳{((customer.stats.revenue.total || 0) / 100).toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Lifetime: ৳{((customer.stats.revenue.lifetime || 0) / 100).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Subscriptions */}
                    {customer.stats.subscriptions && (
                      <div className="space-y-2 p-3 border rounded-md bg-muted/30">
                        <label className="text-xs font-medium text-muted-foreground">Subscriptions</label>
                        <div className="space-y-1">
                          <div className="text-sm">Active: {customer.stats.subscriptions.active || 0}</div>
                          <div className="text-xs text-muted-foreground">
                            Cancelled: {customer.stats.subscriptions.cancelled || 0}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order Dates */}
                  {(customer.stats.firstOrderDate || customer.stats.lastOrderDate) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {customer.stats.firstOrderDate && (
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            First Order
                          </label>
                          <div className="text-sm">
                            {format(new Date(customer.stats.firstOrderDate), 'PPp')}
                          </div>
                        </div>
                      )}
                      {customer.stats.lastOrderDate && (
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Last Order
                          </label>
                          <div className="text-sm">
                            {format(new Date(customer.stats.lastOrderDate), 'PPp')}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Timestamps */}
              {(customer.createdAt || customer.updatedAt) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {customer.createdAt && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Created At</label>
                      <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                        {format(new Date(customer.createdAt), 'PPp')}
                      </div>
                    </div>
                  )}
                  {customer.updatedAt && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                      <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                        {format(new Date(customer.updatedAt), 'PPp')}
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

function MembershipManager({ customer, token }) {
  const membership = customer?.membership || null;
  const { mutateAsync, isLoading } = useCustomerMembership(token);

  const [adjustPoints, setAdjustPoints] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustType, setAdjustType] = useState("bonus");

  const canAdjust = useMemo(() => {
    if (!membership?.cardId) return false;
    const value = Number(adjustPoints);
    return Number.isFinite(value) && value !== 0;
  }, [adjustPoints, membership?.cardId]);

  const handleAction = async (action) => {
    if (!customer?._id) return;
    await mutateAsync({ id: customer._id, action });
  };

  const handleAdjust = async () => {
    if (!customer?._id) return;
    const points = Number(adjustPoints);
    if (!Number.isFinite(points) || points === 0) return;
    await mutateAsync({
      id: customer._id,
      action: "adjust",
      points,
      reason: adjustReason.trim() || undefined,
      type: adjustType,
    });
    setAdjustPoints("");
    setAdjustReason("");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">Membership Status</p>
          </div>
          {membership?.cardId ? (
            membership?.isActive ? (
              <Badge variant="default">Active</Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )
          ) : (
            <Badge variant="secondary">Not enrolled</Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Card ID</p>
            <p className="font-mono">{membership?.cardId || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tier</p>
            <p className="capitalize">{membership?.tier || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Points (Current)</p>
            <p>{membership?.points?.current ?? 0}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Points (Lifetime)</p>
            <p>{membership?.points?.lifetime ?? 0}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {!membership?.cardId && (
            <Button
              type="button"
              size="sm"
              onClick={() => handleAction("enroll")}
              disabled={!token || isLoading}
            >
              Enroll Member
            </Button>
          )}
          {membership?.cardId && membership?.isActive && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleAction("deactivate")}
              disabled={!token || isLoading}
            >
              Deactivate
            </Button>
          )}
          {membership?.cardId && !membership?.isActive && (
            <Button
              type="button"
              size="sm"
              onClick={() => handleAction("reactivate")}
              disabled={!token || isLoading}
            >
              Reactivate
            </Button>
          )}
        </div>
      </div>

      {membership?.cardId && (
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">Adjust Points</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Points (+/-)</Label>
              <Input
                type="number"
                value={adjustPoints}
                onChange={(e) => setAdjustPoints(e.target.value)}
                placeholder="e.g., 200 or -100"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Adjustment Type</Label>
              <Select value={adjustType} onValueChange={setAdjustType}>
                <SelectTrigger disabled={isLoading}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bonus">Bonus</SelectItem>
                  <SelectItem value="correction">Correction</SelectItem>
                  <SelectItem value="manual_redemption">Manual redemption</SelectItem>
                  <SelectItem value="redemption">Redemption</SelectItem>
                  <SelectItem value="expiry">Expiry</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Input
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="Reason for adjustment"
              disabled={isLoading}
            />
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAdjust}
            disabled={!canAdjust || isLoading}
          >
            Apply Adjustment
          </Button>
        </div>
      )}
    </div>
  );
}
