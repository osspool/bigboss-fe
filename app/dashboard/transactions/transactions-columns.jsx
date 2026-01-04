"use client";
import React from "react";
import { Calendar, CreditCard, ArrowDownCircle, ArrowUpCircle, Pencil, Trash2, Globe, Monitor, Server } from "lucide-react";
import { ActionDropdown } from "@classytic/clarity";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const DateCell = React.memo(({ item }) => {
  const dateStr = item.transactionDate || item.date || item.createdAt;
  const display = dateStr ? new Date(dateStr).toLocaleDateString('en-GB') : "-";
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Calendar className="h-4 w-4" />
      <span>{display}</span>
    </div>
  );
});
DateCell.displayName = "DateCell";

/**
 * Flow Cell - Shows inflow/outflow direction
 * Uses the 'flow' field from backend (not derived from type)
 */
const FlowCell = React.memo(({ item }) => {
  const flow = item.flow || 'inflow';
  const isInflow = flow === 'inflow';
  const Icon = isInflow ? ArrowUpCircle : ArrowDownCircle;
  const color = isInflow ? 'text-emerald-600' : 'text-rose-600';
  const bg = isInflow ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100';
  const label = isInflow ? 'Inflow' : 'Outflow';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border ${bg}`}>
      <Icon className={`h-3.5 w-3.5 ${color}`} />
      <span className={`${color}`}>{label}</span>
    </span>
  );
});
FlowCell.displayName = "FlowCell";

/**
 * Type/Category Cell - Shows the transaction category
 * Uses the 'type' field which contains categories like order_purchase, inventory_purchase, etc.
 */
const TypeCell = React.memo(({ item }) => {
  // Display category (type field) - format underscore to readable
  const displayLabel = item.type?.replace(/_/g, ' ') || 'unknown';
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border bg-gray-50 border-gray-200 text-gray-700 capitalize">
      {displayLabel}
    </span>
  );
});
TypeCell.displayName = "TypeCell";

/**
 * Source Cell - Shows where the transaction originated (web, pos, api)
 */
const SourceCell = React.memo(({ item }) => {
  const source = item.source || 'web';
  const sourceConfig = {
    web: { icon: Globe, label: 'Web', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
    pos: { icon: Monitor, label: 'POS', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
    api: { icon: Server, label: 'API', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-100' },
  };
  const config = sourceConfig[source] || sourceConfig.web;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border ${config.bg}`}>
      <Icon className={`h-3.5 w-3.5 ${config.color}`} />
      <span className={config.color}>{config.label}</span>
    </span>
  );
});
SourceCell.displayName = "SourceCell";

const MethodCell = React.memo(({ item }) => {
  const method = item.method;
  const wallet = item.paymentDetails?.walletNumber;
  const bankName = item.paymentDetails?.bankName;
  const accountNumber = item.paymentDetails?.accountNumber;
  const masked = wallet ? `${wallet.slice(0, 3)}****${wallet.slice(-2)}` : undefined;
  const maskedAccount = accountNumber
    ? `${accountNumber.slice(0, 3)}****${accountNumber.slice(-2)}`
    : undefined;
  const parts = [method];
  if (masked) parts.push(masked);
  if (bankName) parts.push(bankName);
  if (maskedAccount) parts.push(maskedAccount);
  return (
    <div className="flex items-center gap-2 text-sm">
      <CreditCard className="h-4 w-4 text-muted-foreground" />
      <span className="capitalize">{parts.join(' • ')}</span>
    </div>
  );
});
MethodCell.displayName = "MethodCell";

/**
 * Amount Cell - Shows gross amount with flow-based coloring
 * Uses flow to determine color (inflow = green, outflow = red)
 */
const AmountCell = React.memo(({ item }) => {
  const isInflow = item.flow === 'inflow';
  const value = Number(item.amount) || 0;
  const amountBdt = value / 100;
  const sign = isInflow ? '+' : '-';
  const color = isInflow ? 'text-emerald-600' : 'text-rose-600';
  return (
    <div className={`text-sm font-medium ${color}`}>{sign}৳{amountBdt.toLocaleString()}</div>
  );
});
AmountCell.displayName = "AmountCell";

/**
 * Net Amount Cell - Shows net amount (amount - fee)
 * Useful for seeing actual received/paid amount after fees
 */
const NetAmountCell = React.memo(({ item }) => {
  const isInflow = item.flow === 'inflow';
  // Use net if available, otherwise calculate from amount - fee
  const netValue = item.net ?? (Number(item.amount) - Number(item.fee || 0));
  const netBdt = netValue / 100;
  const color = isInflow ? 'text-emerald-700' : 'text-rose-700';
  const fee = Number(item.fee || 0) / 100;
  const tax = Number(item.tax || 0) / 100;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`text-sm font-medium ${color} cursor-help`}>৳{netBdt.toLocaleString()}</div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-xs space-y-1">
          <div>Gross: ৳{(Number(item.amount) / 100).toLocaleString()}</div>
          {fee > 0 && <div>Fee: ৳{fee.toLocaleString()}</div>}
          {tax > 0 && <div>Tax: ৳{tax.toLocaleString()}</div>}
          <div className="font-medium">Net: ৳{netBdt.toLocaleString()}</div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
});
NetAmountCell.displayName = "NetAmountCell";

const StatusCell = React.memo(({ item }) => {
  const status = item.status || 'pending';
  const statusColors = {
    completed: 'bg-green-50 text-green-700 border-green-200',
    verified: 'bg-green-50 text-green-700 border-green-200',
    payment_initiated: 'bg-blue-50 text-blue-700 border-blue-200',
    processing: 'bg-blue-50 text-blue-700 border-blue-200',
    requires_action: 'bg-amber-50 text-amber-700 border-amber-200',
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
    cancelled: 'bg-gray-50 text-gray-700 border-gray-200',
    expired: 'bg-gray-50 text-gray-700 border-gray-200',
    refunded: 'bg-gray-50 text-gray-700 border-gray-200',
    partially_refunded: 'bg-gray-50 text-gray-700 border-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${statusColors[status] || statusColors.pending}`}>
      {status}
    </span>
  );
});
StatusCell.displayName = "StatusCell";

const IdCell = React.memo(({ item }) => {
  const id = item._id || item.id || "-";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="text-xs font-mono text-muted-foreground truncate max-w-[140px] cursor-help">{id}</div>
      </TooltipTrigger>
      <TooltipContent>{id}</TooltipContent>
    </Tooltip>
  );
});
IdCell.displayName = "IdCell";

export const transactionsColumns = (onEdit, onDelete) => [
  {
    id: 'date',
    header: 'Date',
    cell: ({ row }) => <DateCell item={row.original} />,
    enableSorting: true,
  },
  {
    id: '_id',
    header: 'ID',
    cell: ({ row }) => <IdCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: 'flow',
    header: 'Flow',
    cell: ({ row }) => <FlowCell item={row.original} />,
    enableSorting: true,
  },
  {
    id: 'type',
    header: 'Type',
    cell: ({ row }) => <TypeCell item={row.original} />,
    enableSorting: true,
  },
  {
    id: 'source',
    header: 'Source',
    cell: ({ row }) => <SourceCell item={row.original} />,
    enableSorting: true,
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusCell item={row.original} />,
    enableSorting: true,
  },
  {
    id: 'method',
    header: 'Method',
    cell: ({ row }) => <MethodCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: 'amount',
    header: 'Gross',
    cell: ({ row }) => <AmountCell item={row.original} />,
    enableSorting: true,
  },
  {
    id: 'net',
    header: 'Net',
    cell: ({ row }) => <NetAmountCell item={row.original} />,
    enableSorting: true,
  },
  {
    id: 'actions',
    header: <div className="text-center">Actions</div>,
    enableSorting: false,
    cell: ({ row }) => {
      const item = row.original;
      const items = [
        { label: 'View', icon: Pencil, onClick: () => onEdit?.(item) },
        ...(onDelete ? [
          { type: 'separator' },
          { label: 'Delete', icon: Trash2, variant: 'destructive', onClick: () => onDelete?.(item) },
        ] : []),
      ].filter(Boolean);
      return (
        <div className="flex items-center justify-center">
          <ActionDropdown items={items} />
        </div>
      );
    }
  }
];


