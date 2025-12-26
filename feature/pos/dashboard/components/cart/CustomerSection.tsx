"use client";

import { UserSearch, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Customer } from "@/types/customer.types";

interface CustomerSectionProps {
  selected: Customer | null;
  name: string;
  phone: string;
  membershipCardId: string;
  membershipStatus: "idle" | "searching" | "found" | "not_found";
  tierName?: string | null;
  tierColor?: string | null;
  tierTextColor?: string | null;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onMembershipChange: (value: string) => void;
  onMembershipLookup: () => void;
  onClear: () => void;
  onOpenLookup: () => void;
}

export function CustomerSection({
  selected,
  name,
  phone,
  membershipCardId,
  membershipStatus,
  tierName,
  tierColor,
  tierTextColor,
  onNameChange,
  onPhoneChange,
  onMembershipChange,
  onMembershipLookup,
  onClear,
  onOpenLookup,
}: CustomerSectionProps) {
  const membershipBadge =
    membershipStatus === "found"
      ? "Member found"
      : membershipStatus === "not_found"
      ? "Not found"
      : membershipStatus === "searching"
      ? "Searching..."
      : "";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Customer</p>
        {selected && (
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onClear}>
            <X className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {selected ? (
        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{selected.name || "Customer"}</p>
              <p className="text-xs text-muted-foreground">{selected.phone}</p>
            </div>
            {(tierName || selected.tier) && (
              <Badge
                variant="secondary"
                className="capitalize"
                style={
                  tierColor
                    ? {
                        backgroundColor: tierColor,
                        color: tierTextColor || "#111827",
                        borderColor: "transparent",
                      }
                    : undefined
                }
              >
                {tierName || selected.tier}
              </Badge>
            )}
          </div>
          {selected.stats?.orders?.total != null && (
            <p className="text-xs text-muted-foreground mt-2">
              Orders: {selected.stats.orders.total}
            </p>
          )}
          {selected.membership?.cardId && (
            <p className="text-xs text-muted-foreground mt-1">
              Card: {selected.membership.cardId}
              {selected.membership?.tier ? ` • ${selected.membership.tier}` : ""}
            </p>
          )}
        </div>
      ) : (
        <>
          <Button
            type="button"
            variant="outline"
            className="w-full h-10 justify-between"
            onClick={onOpenLookup}
          >
            <span className="text-sm text-muted-foreground">Find customer</span>
            <UserSearch className="h-4 w-4 text-muted-foreground" />
          </Button>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Membership card (scan or type)"
                value={membershipCardId}
                onChange={(e) => onMembershipChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onMembershipLookup();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={onMembershipLookup}
              >
                Lookup
              </Button>
            </div>
            {membershipBadge && (
              <p className="text-xs text-muted-foreground">{membershipBadge}</p>
            )}
          </div>
          <Input
            placeholder="Customer name (optional)"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
          />
          <Input
            placeholder="Phone (01XXXXXXXXX)"
            inputMode="numeric"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
          />
        </>
      )}
    </div>
  );
}
