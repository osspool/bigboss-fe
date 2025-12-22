"use client";

import type { ReactNode } from "react";
import { FormSection } from "@/components/form/form-system";
import { ScanAddControls } from "@/feature/inventory/ui/ScanAddControls";
import { LineItemsTable, type BaseLineItem } from "@/feature/inventory/ui/LineItemsTable";

export function InventoryScanSection<TItem extends BaseLineItem>({
  title,
  description,
  icon,
  scan,
  items,
  onQuantityChange,
  onRemove,
  renderRight,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  scan: {
    code: string;
    setCode: (value: string) => void;
    quantity: string;
    setQuantity: (value: string) => void;
    add: () => void | Promise<void>;
    isLookingUp?: boolean;
  };
  items: TItem[];
  onQuantityChange: (index: number, nextQuantity: string) => void;
  onRemove: (index: number) => void;
  renderRight?: (item: TItem, index: number) => ReactNode;
}) {
  return (
    <FormSection title={title} description={description} icon={icon} variant="card">
      <ScanAddControls
        code={scan.code}
        onCodeChange={scan.setCode}
        quantity={scan.quantity}
        onQuantityChange={scan.setQuantity}
        onAdd={scan.add}
        isAdding={scan.isLookingUp}
      />
      <div className="mt-4">
        <LineItemsTable
          items={items}
          onQuantityChange={onQuantityChange}
          onRemove={onRemove}
          renderRight={renderRight}
        />
      </div>
    </FormSection>
  );
}
