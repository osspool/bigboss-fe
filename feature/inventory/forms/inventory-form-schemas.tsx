"use client";

import { ArrowRightLeft, CreditCard, Factory, FileText, Flag, Settings, Store, Truck, Warehouse } from "lucide-react";
import { field, section, type FormSchema } from "@/components/form/form-system";
import type { FieldOption } from "@/components/form/form-system";
import type { StockRequestPriority, PurchasePaymentTerms } from "@/types/inventory.types";

export type TransferFormValues = {
  senderLabel: string;
  receiverBranchId: string;
  remarks: string;
};

// New purchase form values with full API support
export type PurchaseFormValues = {
  supplierId: string;
  purchaseOrderNumber: string;
  paymentTerms: PurchasePaymentTerms;
  creditDays: number;
  autoApprove: boolean;
  autoReceive: boolean;
  notes: string;
};

// Legacy type for backward compatibility
export type LegacyPurchaseFormValues = {
  supplierName: string;
  purchaseOrderNumber: string;
  notes: string;
};

export type RequestFormValues = {
  requestingBranchLabel: string;
  priority: StockRequestPriority;
  reason: string;
};

export function createTransferFormSchema({
  receiverOptions,
}: {
  receiverOptions: FieldOption[];
}): FormSchema<TransferFormValues> {
  return {
    sections: [
      section<TransferFormValues>(
        "route",
        "Route",
        [
          field.text<TransferFormValues>("senderLabel", "From (Sender)", {
            disabled: true,
            readOnly: true,
            IconLeft: <Warehouse className="h-4 w-4" />,
          }),
          field.select<TransferFormValues>("receiverBranchId", "To (Receiver)", receiverOptions, {
            placeholder: "Select branch",
            Icon: Store,
          }),
        ],
        {
          cols: 2,
          variant: "card",
          icon: <ArrowRightLeft className="h-4 w-4" />,
        }
      ),
      section<TransferFormValues>(
        "remarks",
        "Remarks",
        [
          field.textarea<TransferFormValues>("remarks", "Remarks (optional)", {
            rows: 2,
            placeholder: "Add handling notes, dispatch preference, or internal remarks",
          }),
        ],
        {
          cols: 1,
          variant: "card",
          icon: <Truck className="h-4 w-4" />,
        }
      ),
    ],
  };
}

// Payment terms options
const PAYMENT_TERMS_OPTIONS: FieldOption[] = [
  { value: "cash", label: "Cash" },
  { value: "credit", label: "Credit" },
];

/**
 * Create purchase form schema with supplier options
 *
 * @param supplierOptions - Array of supplier options for the combobox
 * @returns FormSchema for purchase creation
 */
export function createPurchaseFormSchema({
  supplierOptions = [],
}: {
  supplierOptions?: FieldOption[];
} = {}): FormSchema<PurchaseFormValues> {
  return {
    sections: [
      section<PurchaseFormValues>(
        "supplier",
        "Supplier & Invoice",
        [
          field.combobox<PurchaseFormValues>("supplierId", "Supplier", supplierOptions, {
            placeholder: "Select supplier",
            searchPlaceholder: "Search suppliers...",
            emptyText: "No suppliers found",
            Icon: Factory,
          }),
          field.text<PurchaseFormValues>("purchaseOrderNumber", "PO Number (optional)", {
            placeholder: "PO-2025-001",
            IconLeft: <FileText className="h-4 w-4" />,
          }),
        ],
        {
          cols: 2,
          variant: "card",
          icon: <Factory className="h-4 w-4" />,
        }
      ),
      section<PurchaseFormValues>(
        "payment",
        "Payment Terms",
        [
          field.select<PurchaseFormValues>("paymentTerms", "Payment Terms", PAYMENT_TERMS_OPTIONS, {
            placeholder: "Select payment terms",
            Icon: CreditCard,
          }),
          field.number<PurchaseFormValues>("creditDays", "Credit Days", {
            placeholder: "15",
            min: 0,
            max: 365,
            description: "Number of days for credit payment (only for credit terms)",
          }),
        ],
        {
          cols: 2,
          variant: "card",
          icon: <CreditCard className="h-4 w-4" />,
        }
      ),
      section<PurchaseFormValues>(
        "options",
        "Processing Options",
        [
          field.switch<PurchaseFormValues>("autoApprove", "Auto-approve", {
            description: "Automatically approve the purchase after creation",
          }),
          field.switch<PurchaseFormValues>("autoReceive", "Auto-receive", {
            description: "Automatically receive and add stock (skips draft status)",
          }),
        ],
        {
          cols: 2,
          variant: "card",
          icon: <Settings className="h-4 w-4" />,
        }
      ),
      section<PurchaseFormValues>(
        "notes",
        "Notes",
        [
          field.textarea<PurchaseFormValues>("notes", "Notes (optional)", {
            rows: 2,
            placeholder: "Supplier invoice details or internal notes",
          }),
        ],
        {
          cols: 1,
          variant: "card",
          icon: <FileText className="h-4 w-4" />,
        }
      ),
    ],
  };
}

/**
 * @deprecated Use createPurchaseFormSchema instead
 * Legacy purchase form schema (backward compatible)
 */
export function createLegacyPurchaseFormSchema(): FormSchema<LegacyPurchaseFormValues> {
  return {
    sections: [
      section<LegacyPurchaseFormValues>(
        "details",
        "Purchase details",
        [
          field.text<LegacyPurchaseFormValues>("supplierName", "Supplier (optional)", {
            placeholder: "Supplier name",
            IconLeft: <Factory className="h-4 w-4" />,
          }),
          field.text<LegacyPurchaseFormValues>("purchaseOrderNumber", "PO Number (optional)", {
            placeholder: "PO-2025-001",
            IconLeft: <FileText className="h-4 w-4" />,
          }),
        ],
        {
          cols: 2,
          variant: "card",
          icon: <Factory className="h-4 w-4" />,
        }
      ),
      section<LegacyPurchaseFormValues>(
        "notes",
        "Notes",
        [
          field.textarea<LegacyPurchaseFormValues>("notes", "Notes (optional)", {
            rows: 2,
            placeholder: "Supplier invoice details or internal notes",
          }),
        ],
        {
          cols: 1,
          variant: "card",
          icon: <FileText className="h-4 w-4" />,
        }
      ),
    ],
  };
}

export function createRequestFormSchema({
  priorityOptions,
}: {
  priorityOptions: FieldOption[];
}): FormSchema<RequestFormValues> {
  return {
    sections: [
      section<RequestFormValues>(
        "details",
        "Request details",
        [
          field.text<RequestFormValues>("requestingBranchLabel", "Requesting Branch", {
            disabled: true,
            readOnly: true,
            IconLeft: <Store className="h-4 w-4" />,
          }),
          field.select<RequestFormValues>("priority", "Priority", priorityOptions, {
            placeholder: "Select priority",
            Icon: Flag,
          }),
        ],
        {
          cols: 2,
          variant: "card",
          icon: <Store className="h-4 w-4" />,
        }
      ),
      section<RequestFormValues>(
        "reason",
        "Reason",
        [
          field.textarea<RequestFormValues>("reason", "Reason (optional)", {
            rows: 2,
            placeholder: "Why do you need this stock?",
          }),
        ],
        {
          cols: 1,
          variant: "card",
          icon: <FileText className="h-4 w-4" />,
        }
      ),
    ],
  };
}
