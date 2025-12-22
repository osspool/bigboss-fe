"use client";

import { ArrowRightLeft, Factory, FileText, Flag, Store, Truck, Warehouse } from "lucide-react";
import { field, section, type FormSchema, type BaseField } from "@/components/form/form-system";
import type { FieldOption } from "@/components/form/form-system";
import type { StockRequestPriority } from "@/types/inventory.types";

export type TransferFormValues = {
  senderLabel: string;
  receiverBranchId: string;
  remarks: string;
};

export type PurchaseFormValues = {
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
        ([
          field.text("senderLabel", "From (Sender)", {
            disabled: true,
            readOnly: true,
            IconLeft: <Warehouse className="h-4 w-4" />,
          }),
          field.select("receiverBranchId", "To (Receiver)", receiverOptions, {
            placeholder: "Select branch",
            Icon: Store,
          }),
        ] as BaseField<TransferFormValues>[]),
        {
          cols: 2,
          variant: "card",
          icon: <ArrowRightLeft className="h-4 w-4" />,
        }
      ),
      section<TransferFormValues>(
        "remarks",
        "Remarks",
        ([
          field.textarea("remarks", "Remarks (optional)", {
            rows: 2,
            placeholder: "Add handling notes, dispatch preference, or internal remarks",
          }),
        ] as BaseField<TransferFormValues>[]),
        {
          cols: 1,
          variant: "card",
          icon: <Truck className="h-4 w-4" />,
        }
      ),
    ],
  };
}

export function createPurchaseFormSchema(): FormSchema<PurchaseFormValues> {
  return {
    sections: [
      section<PurchaseFormValues>(
        "details",
        "Purchase details",
        ([
          field.text("supplierName", "Supplier (optional)", {
            placeholder: "Supplier name",
            IconLeft: <Factory className="h-4 w-4" />,
          }),
          field.text("purchaseOrderNumber", "PO Number (optional)", {
            placeholder: "PO-2025-001",
            IconLeft: <FileText className="h-4 w-4" />,
          }),
        ] as BaseField<PurchaseFormValues>[]),
        {
          cols: 2,
          variant: "card",
          icon: <Factory className="h-4 w-4" />,
        }
      ),
      section<PurchaseFormValues>(
        "notes",
        "Notes",
        ([
          field.textarea("notes", "Notes (optional)", {
            rows: 2,
            placeholder: "Supplier invoice details or internal notes",
          }),
        ] as BaseField<PurchaseFormValues>[]),
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
        ([
          field.text("requestingBranchLabel", "Requesting Branch", {
            disabled: true,
            readOnly: true,
            IconLeft: <Store className="h-4 w-4" />,
          }),
          field.select("priority", "Priority", priorityOptions, {
            placeholder: "Select priority",
            Icon: Flag,
          }),
        ] as BaseField<RequestFormValues>[]),
        {
          cols: 2,
          variant: "card",
          icon: <Store className="h-4 w-4" />,
        }
      ),
      section<RequestFormValues>(
        "reason",
        "Reason",
        ([
          field.textarea("reason", "Reason (optional)", {
            rows: 2,
            placeholder: "Why do you need this stock?",
          }),
        ] as BaseField<RequestFormValues>[]),
        {
          cols: 1,
          variant: "card",
          icon: <FileText className="h-4 w-4" />,
        }
      ),
    ],
  };
}
