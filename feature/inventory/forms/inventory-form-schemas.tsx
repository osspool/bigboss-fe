"use client";

import { ArrowRightLeft, Factory, FileText, Flag, Store, Truck, Warehouse } from "lucide-react";
import { field, section, type FormSchema } from "@/components/form/form-system";
import type { FieldOption } from "@/components/form/form-system";

export function createTransferFormSchema({
  receiverOptions,
}: {
  receiverOptions: FieldOption[];
}): FormSchema {
  return {
    sections: [
      section(
        "route",
        "Route",
        [
          field.text("senderLabel", "From (Sender)", {
            disabled: true,
            readOnly: true,
            IconLeft: <Warehouse className="h-4 w-4" />,
          }),
          field.select("receiverBranchId", "To (Receiver)", receiverOptions, {
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
      section(
        "remarks",
        "Remarks",
        [
          field.textarea("remarks", "Remarks (optional)", {
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

export function createPurchaseFormSchema(): FormSchema {
  return {
    sections: [
      section(
        "details",
        "Purchase details",
        [
          field.text("supplierName", "Supplier (optional)", {
            placeholder: "Supplier name",
            IconLeft: <Factory className="h-4 w-4" />,
          }),
          field.text("purchaseOrderNumber", "PO Number (optional)", {
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
      section(
        "notes",
        "Notes",
        [
          field.textarea("notes", "Notes (optional)", {
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
}): FormSchema {
  return {
    sections: [
      section(
        "details",
        "Request details",
        [
          field.text("requestingBranchLabel", "Requesting Branch", {
            disabled: true,
            readOnly: true,
            IconLeft: <Store className="h-4 w-4" />,
          }),
          field.select("priority", "Priority", priorityOptions, {
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
      section(
        "reason",
        "Reason",
        [
          field.textarea("reason", "Reason (optional)", {
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
