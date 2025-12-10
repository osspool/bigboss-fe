import {
  PAYMENT_METHOD_OPTIONS,
  MANUAL_CATEGORY_OPTIONS,
  TRANSACTION_TARGET_MODEL_OPTIONS,
  TRANSACTION_STATUS_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
} from "@/constants/enums/monetization.enum";
import { Info, ChevronDown, Calendar, Database } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import FormInput from "@/components/form/form-utils/form-input";
import SelectInput from "@/components/form/form-utils/select-input";
import { AccordionWrapper, AccordionWrapperTrigger, AccordionWrapperContent } from "@/components/custom/ui/accordion-wrapper";
import { field, section } from "@/components/form/form-system";
import { format } from "date-fns";

/**
 * Get payment field configurations based on payment method
 * Returns field definitions without using field helpers (for dynamic rendering)
 */
const getPaymentFieldsByMethod = (method) => {
  const fieldConfigs = {
    cash: [],
    bank: [
      { name: "paymentDetails.bankName", label: "Bank Name", placeholder: "e.g., Barclays" },
      { name: "paymentDetails.accountNumber", label: "Account Number", placeholder: "" },
      { name: "paymentDetails.accountName", label: "Account Name", placeholder: "" },
    ],
    card: [], // Managed by Stripe gateway
    online: [
      { name: "paymentDetails.provider", label: "Provider", placeholder: "e.g., PayPal" },
      { name: "paymentDetails.trxId", label: "Transaction ID", placeholder: "" },
    ],
    manual: [
      { name: "paymentDetails.provider", label: "Provider/Method", placeholder: "e.g., Cash, Cheque" },
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

      // Basic Information Section
      section(
        "basic",
        "Transaction Details",
        [
          // Category field (read-only when editing)
          isEdit
            ? field.custom("category", "Category", ({ control }) => {
                const category = transaction?.category || "";
                return (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                      {getCategoryLabel(category)}
                    </div>
                  </div>
                );
              })
            : field.select("category", "Category", MANUAL_CATEGORY_OPTIONS, {
                placeholder: "Select category",
                required: true,
              }),

          // Type field
          ...(isEdit
            ? [
                // Read-only when editing
                field.custom("type", "Type", () => {
                  const type = transaction?.type || "N/A";
                  const bgColor = type === "income" ? "bg-green-50 text-green-700 border-green-200" :
                                  type === "expense" ? "bg-red-50 text-red-700 border-red-200" :
                                  "bg-muted";
                  return (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Type</label>
                      <div className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm font-medium ${bgColor}`}>
                        {type.replace(/\b\w/g, (l) => l.toUpperCase())}
                      </div>
                    </div>
                  );
                }),
              ]
            : [
                // Editable when creating
                field.select("type", "Type", TRANSACTION_TYPE_OPTIONS, {
                  placeholder: "Select type",
                  required: true,
                }),
              ]),

          // Currency field (read-only for visibility)
          ...(currencyValue
            ? [
                field.custom("currency", "Currency", () => {
                  return (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Currency</label>
                      <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                        {currencyValue}
                      </div>
                    </div>
                  );
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
          field.number("amount", "Amount (৳)", {
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
      ...(isEdit && (transaction?.customerId || transaction?.appointmentId || transaction?.referenceId)
        ? [
            {
              id: "references",
              render: () => (
                <AccordionWrapper
                  trigger={
                    <AccordionWrapperTrigger>
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Reference Information</span>
                      </div>
                    </AccordionWrapperTrigger>
                  }
                  defaultOpen={false}
                  className="border-0 border-t"
                >
                  <AccordionWrapperContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {transaction.customerId && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Customer ID</label>
                          <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono truncate">
                            {transaction.customerId}
                          </div>
                        </div>
                      )}
                      {transaction.appointmentId && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Appointment ID</label>
                          <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono truncate">
                            {transaction.appointmentId}
                          </div>
                        </div>
                      )}
                      {transaction.referenceModel && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Reference Model</label>
                          <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                            {transaction.referenceModel}
                          </div>
                        </div>
                      )}
                      {transaction.referenceId && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Reference ID</label>
                          <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono truncate">
                            {transaction.referenceId}
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
                  </AccordionWrapperContent>
                </AccordionWrapper>
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
                <AccordionWrapper
                  trigger={
                    <AccordionWrapperTrigger>
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Gateway Information</span>
                      </div>
                    </AccordionWrapperTrigger>
                  }
                  defaultOpen={false}
                  className="border-0 border-t"
                >
                  <AccordionWrapperContent>
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
                  </AccordionWrapperContent>
                </AccordionWrapper>
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
                <AccordionWrapper
                  trigger={
                    <AccordionWrapperTrigger>
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Metadata</span>
                      </div>
                    </AccordionWrapperTrigger>
                  }
                  defaultOpen={false}
                  className="border-0 border-t"
                >
                  <AccordionWrapperContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(transaction.metadata).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </label>
                          <div className="flex min-h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm wrap-break-word">
                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionWrapperContent>
                </AccordionWrapper>
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
                <AccordionWrapper
                  trigger={
                    <AccordionWrapperTrigger>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Timestamps</span>
                      </div>
                    </AccordionWrapperTrigger>
                  }
                  defaultOpen={false}
                  className="border-0 border-t"
                >
                  <AccordionWrapperContent>
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
                  </AccordionWrapperContent>
                </AccordionWrapper>
              ),
            },
          ]
        : []),

      // Advanced Options Section (only when creating, collapsed by default)
      ...(!isEdit && editableFields.advanced
        ? [
            {
              id: "advanced",
              render: ({ control, disabled }) => (
                <AccordionWrapper
                  trigger={
                    <AccordionWrapperTrigger>
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Advanced Options</span>
                        <span className="text-xs text-muted-foreground">(Optional)</span>
                      </div>
                    </AccordionWrapperTrigger>
                  }
                  defaultOpen={false}
                  className="border-0 border-t"
                >
                  <AccordionWrapperContent>
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
                        name="referenceId"
                        label="Reference ID"
                        placeholder="Link to entity"
                        disabled={disabled}
                      />
                      <SelectInput
                        control={control}
                        name="referenceModel"
                        label="Reference Model"
                        items={TRANSACTION_TARGET_MODEL_OPTIONS}
                        placeholder="Select model"
                        disabled={disabled}
                      />
                    </div>
                  </AccordionWrapperContent>
                </AccordionWrapper>
              ),
            },
          ]
        : []),
    ],
  };
};
