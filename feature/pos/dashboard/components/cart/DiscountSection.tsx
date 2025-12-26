"use client";

import { Lock, ShieldCheck, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DiscountSectionProps {
  value: string;
  onChange: (value: string) => void;
  // Authorization props
  isAuthorized: boolean;
  authorizedByName?: string | null;
  onRequestAuth: () => void;
  onClearAuth?: () => void;
}

export function DiscountSection({
  value,
  onChange,
  isAuthorized,
  authorizedByName,
  onRequestAuth,
  onClearAuth,
}: DiscountSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Discount</p>
        {isAuthorized && authorizedByName && (
          <Badge variant="outline" className="text-xs gap-1 text-green-600 border-green-200 bg-green-50">
            <ShieldCheck className="h-3 w-3" />
            {authorizedByName}
            {onClearAuth && (
              <button
                type="button"
                onClick={onClearAuth}
                className="ml-1 hover:text-red-500 transition-colors"
                aria-label="Clear authorization"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        )}
      </div>

      {isAuthorized ? (
        <Input
          placeholder="Discount (BDT)"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-muted-foreground font-normal h-10",
            "hover:border-amber-300 hover:bg-amber-50/50"
          )}
          onClick={onRequestAuth}
        >
          <Lock className="h-4 w-4 mr-2 text-amber-500" />
          Manager authorization required
        </Button>
      )}
    </div>
  );
}
