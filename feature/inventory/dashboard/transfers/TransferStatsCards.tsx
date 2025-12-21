"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Truck, Package, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TransferStats } from "@/types/inventory.types";

interface TransferStatsCardsProps {
  stats: TransferStats | undefined;
  isLoading: boolean;
}

export function TransferStatsCards({ stats, isLoading }: TransferStatsCardsProps) {
  const cards = [
    {
      label: "Total Transfers",
      value: stats?.total || 0,
      icon: Truck,
      color: "primary",
    },
    {
      label: "Pending",
      value: stats?.pending || 0,
      icon: Clock,
      color: "warning",
    },
    {
      label: "In Transit",
      value: stats?.inTransit || 0,
      icon: Package,
      color: "info",
    },
    {
      label: "Received",
      value: stats?.byStatus?.received || 0,
      icon: CheckCircle2,
      color: "success",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold tracking-tight">
                  {isLoading ? "-" : card.value}
                </p>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </div>
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  card.color === "primary" && "bg-primary/10 text-primary",
                  card.color === "warning" && "bg-warning/10 text-warning",
                  card.color === "info" && "bg-blue-500/10 text-blue-500",
                  card.color === "success" && "bg-success/10 text-success"
                )}
              >
                <card.icon className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
