"use client";
import React from "react";
import { Calendar, CreditCard, ArrowDownCircle, ArrowUpCircle, Pencil, Trash2 } from "lucide-react";
import { ActionDropdown } from "@/components/custom/ui/dropdown-wrapper";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const DateCell = React.memo(({ item }) => {
  const dateStr = item.date || item.createdAt;
  const display = dateStr ? new Date(dateStr).toLocaleDateString('en-GB') : "-";
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Calendar className="h-4 w-4" />
      <span>{display}</span>
    </div>
  );
});
DateCell.displayName = "DateCell";

const TypeCell = React.memo(({ item }) => {
  const isIncome = item.type === 'income';
  const Icon = isIncome ? ArrowUpCircle : ArrowDownCircle;
  const color = isIncome ? 'text-emerald-600' : 'text-rose-600';
  const bg = isIncome ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border ${bg}`}>
      <Icon className={`h-3.5 w-3.5 ${color}`} />
      <span className={`capitalize ${color}`}>{item.type}</span>
    </span>
  );
});
TypeCell.displayName = "TypeCell";

const MethodCell = React.memo(({ item }) => {
  const method = item.method;
  const provider = item.paymentDetails?.provider;
  const wallet = item.paymentDetails?.walletNumber;
  const masked = wallet ? `${wallet.slice(0, 3)}****${wallet.slice(-2)}` : undefined;
  const parts = [method];
  if (provider && provider !== method) parts.push(provider);
  if (masked) parts.push(masked);
  return (
    <div className="flex items-center gap-2 text-sm">
      <CreditCard className="h-4 w-4 text-muted-foreground" />
      <span className="capitalize">{parts.join(' • ')}</span>
    </div>
  );
});
MethodCell.displayName = "MethodCell";

const AmountCell = React.memo(({ item }) => {
  const isIncome = item.type === 'income';
  const value = Number(item.amount) || 0;
  const sign = isIncome ? '' : '-';
  const color = isIncome ? 'text-emerald-600' : 'text-rose-600';
  return (
    <div className={`text-sm font-medium ${color}`}>{sign}৳{value}</div>
  );
});
AmountCell.displayName = "AmountCell";

const StatusCell = React.memo(({ item }) => {
  const status = item.status || 'pending';
  const statusColors = {
    verified: 'bg-green-50 text-green-700 border-green-200',
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
    refunded: 'bg-gray-50 text-gray-700 border-gray-200',
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
    id: 'type',
    header: 'Type',
    cell: ({ row }) => <TypeCell item={row.original} />,
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
    header: 'Amount',
    cell: ({ row }) => <AmountCell item={row.original} />,
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


