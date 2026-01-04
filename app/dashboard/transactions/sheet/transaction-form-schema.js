import {
  PAYMENT_METHOD_OPTIONS,
  MANUAL_CATEGORY_OPTIONS,
  TRANSACTION_TARGET_MODEL_OPTIONS,
  TRANSACTION_STATUS_OPTIONS,
  ORDER_SOURCE_OPTIONS,
} from "@/constants/enums/monetization.enum";
import { Info, Calendar, Database, Banknote } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormInput, SelectInput, AccordionSection } from "@classytic/clarity";
import { field, section } from "@/components/form/form-system";
import { format } from "date-fns";

/**
 * Get payment field configurations based on payment method
 * Returns field definitions without using field helpers (for dynamic rendering)
 */
const getPaymentFieldsByMethod = (method) => {
  const fieldConfigs = {
    cash: [],
    bank_transfer: [
      { name: "paymentDetails.bankName", label: "Bank Name", placeholder: "e.g., ABC Bank" },
      { name: "paymentDetails.accountNumber", label: "Account Number", placeholder: "" },
      { name: "paymentDetails.accountName", label: "Account Name", placeholder: "" },
    ],
    bkash: [
      { name: "paymentDetails.walletNumber", label: "Wallet Number", placeholder: "01XXXXXXXXX" },
      { name: "paymentDetails.walletType", label: "Wallet Type", placeholder: "personal or merchant" },
    ],
    nagad: [
      { name: "paymentDetails.walletNumber", label: "Wallet Number", placeholder: "01XXXXXXXXX" },
      { name: "paymentDetails.walletType", label: "Wallet Type", placeholder: "personal or merchant" },
    ],
    rocket: [
      { name: "paymentDetails.walletNumber", label: "Wallet Number", placeholder: "01XXXXXXXXX" },
      { name: "paymentDetails.walletType", label: "Wallet Type", placeholder: "personal or merchant" },
    ],
    card: [], // Managed by gateway
    online: [
      { name: "paymentDetails.proofUrl", label: "Proof URL", placeholder: "" },
    ],
    manual: [
      { name: "paymentDetails.proofUrl", label: "Proof URL", placeholder: "" },
    ],
  };

  return fieldConfigs[method] || [];
};

/**
 * Get category display label
 */
const getCategoryLabel = (category) => {
  if (!category) return "";
  return category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

/**
 * Create transaction form schema
 * @param {Object} options - Schema options
 * @param {boolean} options.isEdit - Whether this is an edit form
 * @param {Object} options.transaction - Existing transaction (for edit mode)
 * @param {Object} options.editableFields - Field permissions based on transaction type/status
 * @param {boolean} options.isLibraryManaged - Whether transaction is library-managed
 * @param {boolean} options.isVerified - Whether transaction is verified
 * @param {string} [options.currency] - Currency code to display (fallback to transaction currency)
 * @returns {Object} Form schema
 */
export const createTransactionFormSchema = ({
  isEdit = false,
  transaction = null,
  editableFields = {},
  isLibraryManaged = false,
  isVerified = false,
  currency = "",
}) => {
  const currencyValue = currency || transaction?.currency || transaction?.metadata?.currency;

  return {
    sections: [
      // Alert section for library-managed transactions
      ...(isEdit && isLibraryManaged ? [
        {
          id: "alert",
          render: () => (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This is a system-managed transaction (created by subscription/enrollment/HRM workflows).
                Only notes can be edited. Status is managed by webhooks.
              </AlertDescription>
            </Alert>
          ),
        },
      ] : []),

      // Transaction Classification Section (only when editing - shows flow, category, source)
      ...(isEdit
        ? [
            {
              id: "classification",
              title: "Transaction Details",
              render: () => {
                const flow = transaction?.flow || "";
                const type = transaction?.type || "N/A";
                const source = transaction?.source || "";

                const isInflow = flow === "inflow";
                const flowBgColor = isInflow
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200";
                const flowLabel = isInflow ? "Inflow (Income)" : "Outflow (Expense)";

                const getSourceLabel = (src) => {
                  switch (src) {
                    case 'pos': return 'POS';
                    case 'api': return 'API';
                    case 'web': return 'Web';
                    default: return src || 'N/A';
                  }
                };
                const getSourceColor = (src) => {
                  switch (src) {
                    case 'pos': return 'text-purple-600 bg-purple-50 border-purple-200';
                    case 'api': return 'text-gray-600 bg-gray-50 border-gray-200';
                    default: return 'text-blue-600 bg-blue-50 border-blue-200';
                  }
                };

                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Flow</label>
                      <div className={`flex items-center gap-2 h-10 w-full rounded-md border px-3 py-2 text-sm font-medium ${flow ? flowBgColor : 'border-input bg-muted'}`}>
                        {flow ? flowLabel : "N/A"}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm capitalize">
                        {getCategoryLabel(type)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Source</label>
                      <div className={`flex items-center gap-2 h-10 w-full rounded-md border px-3 py-2 text-sm font-medium ${source ? getSourceColor(source) : 'border-input bg-muted'}`}>
                        {getSourceLabel(source)}
                      </div>
                    </div>
                  </div>
                );
              },
            },
          ]
        : []),

      // Basic Information Section
      section(
        "basic",
        isEdit ? "" : "Transaction Details",
        [
          // When creating - select type which determines flow
          ...(!isEdit
            ? [
                field.select("type", "Category", MANUAL_CATEGORY_OPTIONS, {
                  placeholder: "Select category",
                  required: true,
                }),
              ]
            : []),

          // Currency field (read-only for visibility)
          ...(currencyValue
            ? [
                field.text("currency_display", "Currency", {
                  disabled: true,
                  defaultValue: currencyValue,
                }),
              ]
            : []),

          // Status field
          // - When creating: Always shown for manual transactions (defaults to 'pending' if not set)
          // - When editing: Only shown for manual transactions (library-managed status is webhook-controlled)
          ...(!isLibraryManaged && (isEdit ? editableFields.status : true)
            ? [
                field.select("status", "Status", TRANSACTION_STATUS_OPTIONS, {
                  placeholder: isEdit ? "Select status" : "Select status (optional, defaults to 'pending')",
                  disabled: isEdit && !editableFields.status,
                }),
              ]
            : []),

          // Amount (displayed in Taka, stored in Paisa)
          field.number("amount", "Gross Amount (৳)", {
            min: 0,
            step: 0.01,
            required: !isEdit,
            disabled: !editableFields.amount,
            transform: {
              // Convert from Paisa to Taka for display (1 Taka = 100 Paisa)
              input: (v) => {
                if (v === undefined || v === null) return "0";
                const taka = Number(v) / 100;
                return String(taka);
              },
              // Convert from Taka to Paisa for storage
              output: (v) => {
                const taka = Number(v) || 0;
                return Math.round(taka * 100);
              },
            },
          }),
        ],
        { cols: 3 }
      ),

      // Amounts Section (only when editing and has fee/tax/net)
      ...(isEdit && (transaction?.fee || transaction?.tax || transaction?.net !== undefined)
        ? [
            {
              id: "amounts",
              render: () => {
                const amount = Number(transaction?.amount || 0) / 100;
                const fee = Number(transaction?.fee || 0) / 100;
                const tax = Number(transaction?.tax || 0) / 100;
                const net = Number(transaction?.net ?? (transaction?.amount - (transaction?.fee || 0))) / 100;
                const isInflow = transaction?.flow === 'inflow';
                const netColor = isInflow ? 'text-emerald-700' : 'text-rose-700';

                return (
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Banknote className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">Amount Breakdown</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Gross Amount</label>
                        <div className="text-sm font-medium">৳{amount.toLocaleString()}</div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Fee</label>
                        <div className="text-sm font-medium">৳{fee.toLocaleString()}</div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Tax</label>
                        <div className="text-sm font-medium">৳{tax.toLocaleString()}</div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Net Amount</label>
                        <div className={`text-sm font-semibold ${netColor}`}>৳{net.toLocaleString()}</div>
                      </div>
                    </div>
                    {transaction?.taxDetails && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          {transaction.taxDetails.type && (
                            <div>
                              <span className="text-muted-foreground">Tax Type:</span>{' '}
                              <span className="uppercase">{transaction.taxDetails.type}</span>
                            </div>
                          )}
                          {transaction.taxDetails.rate !== undefined && (
                            <div>
                              <span className="text-muted-foreground">Rate:</span>{' '}
                              <span>{(transaction.taxDetails.rate * 100).toFixed(1)}%</span>
                            </div>
                          )}
                          {transaction.taxDetails.isInclusive !== undefined && (
                            <div>
                              <span className="text-muted-foreground">Inclusive:</span>{' '}
                              <span>{transaction.taxDetails.isInclusive ? 'Yes' : 'No'}</span>
                            </div>
                          )}
                          {transaction.taxDetails.jurisdiction && (
                            <div>
                              <span className="text-muted-foreground">Jurisdiction:</span>{' '}
                              <span>{transaction.taxDetails.jurisdiction}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              },
            },
          ]
        : []),

      // Payment Information Section
      section(
        "payment",
        "Payment Information",
        [
          field.date("transactionDate", "Transaction Date", {
            disabled: !editableFields.transactionDate,
          }),
          field.select("method", "Payment Method", PAYMENT_METHOD_OPTIONS, {
            required: !isEdit,
            disabled: !editableFields.method,
          }),
          field.text("reference", "Payment Reference", {
            placeholder: "TrxID, receipt no, etc.",
            disabled: !editableFields.reference,
          }),
        ],
        { cols: 3 }
      ),

      // Payment Details Section (conditional based on method)
      {
        id: "paymentDetails",
        title: "Payment Details",
        condition: (control) => {
          const method = control?._formValues?.method;
          return method && method !== "cash" && method !== "card" && getPaymentFieldsByMethod(method).length > 0;
        },
        render: ({ control, disabled }) => {
          const method = control?._formValues?.method || "cash";
          const fields = getPaymentFieldsByMethod(method);

          if (fields.length === 0) return null;

          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {fields.map((fieldDef) => {
                const isDisabled = disabled || !editableFields.paymentDetails;

                return (
                  <FormInput
                    key={fieldDef.name}
                    control={control}
                    name={fieldDef.name}
                    label={fieldDef.label}
                    placeholder={fieldDef.placeholder}
                    disabled={isDisabled}
                  />
                );
              })}
            </div>
          );
        },
      },

      // Additional Information Section
      section(
        "additional",
        "Additional Information",
        [
          field.textarea("description", "Description", {
            rows: 2,
            placeholder: "Optional description...",
            disabled: !editableFields.description,
            fullWidth: true,
          }),
          field.textarea("notes", "Notes", {
            rows: 3,
            placeholder: "Add any notes...",
            disabled: !editableFields.notes,
            fullWidth: true,
          }),
        ],
        { cols: 1 }
      ),

      // Reference Information Section (only when editing and has references)
      ...(isEdit && (transaction?.customerId || transaction?.sourceId || transaction?.branch || transaction?.relatedTransactionId)
        ? [
            {
              id: "references",
              render: () => (
                <AccordionSection
                  title="Reference Information"
                  icon={<Database className="h-4 w-4" />}
                  className="border-t"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {transaction.sourceModel && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Source Model</label>
                        <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                          {transaction.sourceModel}
                        </div>
                      </div>
                    )}
                    {transaction.sourceId && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Source ID</label>
                        <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono truncate">
                          {transaction.sourceId}
                        </div>
                      </div>
                    )}
                    {transaction.customerId && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Customer ID</label>
                        <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono truncate">
                          {transaction.customerId}
                        </div>
                      </div>
                    )}
                    {transaction.handledBy && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Handled By</label>
                        <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono truncate">
                          {transaction.handledBy}
                        </div>
                      </div>
                    )}
                    {transaction.branch && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Branch ID</label>
                        <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono truncate">
                          {transaction.branch}
                        </div>
                      </div>
                    )}
                    {transaction.relatedTransactionId && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Related Transaction</label>
                        <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono truncate">
                          {transaction.relatedTransactionId}
                        </div>
                      </div>
                    )}
                    {transaction.idempotencyKey && (
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Idempotency Key</label>
                        <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono truncate">
                          {transaction.idempotencyKey}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionSection>
              ),
            },
          ]
        : []),

      // Gateway Information Section (only when editing and gateway exists)
      ...(isEdit && transaction?.gateway
        ? [
            {
              id: "gateway",
              render: () => (
                <AccordionSection
                  title="Gateway Information"
                  icon={<Database className="h-4 w-4" />}
                  className="border-t"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Gateway Type</label>
                      <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                        {transaction.gateway.type || "N/A"}
                      </div>
                    </div>
                    {transaction.gateway.paymentIntentId && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Payment Intent ID</label>
                        <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm truncate">
                          {transaction.gateway.paymentIntentId}
                        </div>
                      </div>
                    )}
                    {transaction.gateway.sessionId && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Session ID</label>
                        <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm truncate">
                          {transaction.gateway.sessionId}
                        </div>
                      </div>
                    )}
                    {transaction.gateway.paymentUrl && (
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Payment URL</label>
                        <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm truncate">
                          <a href={transaction.gateway.paymentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {transaction.gateway.paymentUrl}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionSection>
              ),
            },
          ]
        : []),

      // Metadata Section (only when editing and metadata exists)
      ...(isEdit && transaction?.metadata && Object.keys(transaction.metadata).length > 0
        ? [
            {
              id: "metadata",
              render: () => (
                <AccordionSection
                  title="Metadata"
                  icon={<Info className="h-4 w-4" />}
                  className="border-t"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(transaction.metadata).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </label>
                        <div className="flex min-h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm break-words">
                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionSection>
              ),
            },
          ]
        : []),

      // Timestamps Section (only when editing)
      ...(isEdit
        ? [
            {
              id: "timestamps",
              render: () => (
                <AccordionSection
                  title="Timestamps"
                  icon={<Calendar className="h-4 w-4" />}
                  className="border-t"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {transaction.createdAt && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Created At</label>
                        <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                          {format(new Date(transaction.createdAt), 'PPpp')}
                        </div>
                      </div>
                    )}
                    {transaction.updatedAt && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                        <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                          {format(new Date(transaction.updatedAt), 'PPpp')}
                        </div>
                      </div>
                    )}
                    {transaction.verifiedAt && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Verified At</label>
                        <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                          {format(new Date(transaction.verifiedAt), 'PPpp')}
                        </div>
                      </div>
                    )}
                    {transaction.paidAt && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Paid At</label>
                        <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                          {format(new Date(transaction.paidAt), 'PPpp')}
                        </div>
                      </div>
                    )}
                    {transaction.failedAt && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Failed At</label>
                        <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                          {format(new Date(transaction.failedAt), 'PPpp')}
                        </div>
                      </div>
                    )}
                    {transaction.refundedAt && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Refunded At</label>
                        <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                          {format(new Date(transaction.refundedAt), 'PPpp')}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionSection>
              ),
            },
          ]
        : []),

      // Advanced Options Section (only when creating, collapsed by default)
      // Note: Per API docs, transactions are system-managed and cannot be created from FE
      // This section is kept for potential future manual transaction support
      ...(!isEdit && editableFields.advanced
        ? [
            {
              id: "advanced",
              render: ({ control, disabled }) => (
                <AccordionSection
                  title="Advanced Options"
                  icon={<Info className="h-4 w-4" />}
                  badge={<span className="text-xs text-muted-foreground">(Optional)</span>}
                  className="border-t"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput
                      control={control}
                      name="customerId"
                      label="Customer ID"
                      placeholder="Optional"
                      disabled={disabled}
                    />
                    <FormInput
                      control={control}
                      name="sourceId"
                      label="Source ID"
                      placeholder="Link to source document"
                      disabled={disabled}
                    />
                    <SelectInput
                      control={control}
                      name="sourceModel"
                      label="Source Model"
                      items={TRANSACTION_TARGET_MODEL_OPTIONS}
                      placeholder="Select model"
                      disabled={disabled}
                    />
                  </div>
                </AccordionSection>
              ),
            },
          ]
        : []),
    ],
  };
};
