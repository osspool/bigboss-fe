"use client";

import { useEffect, useMemo, useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { customerApi } from "@/api/platform/customer-api";
import type { Customer } from "@/types/customer.types";
import { toast } from "sonner";

interface CustomerQuickAddDialogProps {
  token: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultName?: string;
  defaultPhone?: string;
  onCreated: (customer: Customer) => void;
}

const isValidPhone = (value: string) => /^01\d{9}$/.test(value);

export function CustomerQuickAddDialog({
  token,
  open,
  onOpenChange,
  defaultName,
  defaultPhone,
  onCreated,
}: CustomerQuickAddDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(defaultName || "");
    setPhone(defaultPhone || "");
  }, [open, defaultName, defaultPhone]);

  const canSubmit = useMemo(() => {
    return name.trim().length > 1 && isValidPhone(phone.trim());
  }, [name, phone]);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      toast.error("Customer name is required");
      return;
    }
    if (!isValidPhone(trimmedPhone)) {
      toast.error("Phone number must be 11 digits (01XXXXXXXXX)");
      return;
    }

    try {
      setIsSaving(true);
      const response = await customerApi.create({
        token,
        data: { name: trimmedName, phone: trimmedPhone },
      });
      const created = response?.data;
      if (!created) {
        toast.error("Customer saved, but response was empty");
        return;
      }
      onCreated(created as Customer);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create customer");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add customer
          </DialogTitle>
          <DialogDescription>Quickly add a customer for POS loyalty tracking.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Phone (01XXXXXXXXX)"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isSaving}>
            Save Customer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
