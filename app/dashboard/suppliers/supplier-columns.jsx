"use client";
import React from "react";
import { Building2, Phone, Mail, Calendar, Pencil, CreditCard, User, Hash } from "lucide-react";
import { ActionDropdown } from "@/components/custom/ui/dropdown-wrapper";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const CodeCell = React.memo(({ item }) => {
  const code = item.code || "-";
  return (
    <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
      <Hash className="h-4 w-4" />
      <span>{code}</span>
    </div>
  );
});
CodeCell.displayName = "CodeCell";

const NameCell = React.memo(({ item }) => {
  const name = item.name || "-";
  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <span>{name}</span>
    </div>
  );
});
NameCell.displayName = "NameCell";

const ContactCell = React.memo(({ item }) => {
  const contactPerson = item.contactPerson || "-";
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <User className="h-4 w-4" />
      <span>{contactPerson}</span>
    </div>
  );
});
ContactCell.displayName = "ContactCell";

const PhoneCell = React.memo(({ item }) => {
  const phone = item.phone || "-";
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Phone className="h-4 w-4" />
      <span>{phone}</span>
    </div>
  );
});
PhoneCell.displayName = "PhoneCell";

const TypeCell = React.memo(({ item }) => {
  const type = item.type || "-";
  const typeColors = {
    local: 'bg-green-50 text-green-700 border-green-200',
    import: 'bg-blue-50 text-blue-700 border-blue-200',
    manufacturer: 'bg-purple-50 text-purple-700 border-purple-200',
    wholesaler: 'bg-orange-50 text-orange-700 border-orange-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border capitalize ${typeColors[type] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
      {type}
    </span>
  );
});
TypeCell.displayName = "TypeCell";

const PaymentTermsCell = React.memo(({ item }) => {
  const paymentTerms = item.paymentTerms || "-";
  const creditDays = item.creditDays || 0;
  const termColors = {
    cash: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    credit: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border capitalize w-fit ${termColors[paymentTerms] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
        <CreditCard className="h-3 w-3 mr-1" />
        {paymentTerms}
      </span>
      {paymentTerms === 'credit' && creditDays > 0 && (
        <span className="text-xs text-muted-foreground">{creditDays} days</span>
      )}
    </div>
  );
});
PaymentTermsCell.displayName = "PaymentTermsCell";

const StatusCell = React.memo(({ item }) => {
  const isActive = item.isActive !== false;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
});
StatusCell.displayName = "StatusCell";

const DateCell = React.memo(({ item }) => {
  const dateStr = item.createdAt;
  const display = dateStr ? new Date(dateStr).toLocaleDateString('en-GB') : "-";
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Calendar className="h-4 w-4" />
      <span>{display}</span>
    </div>
  );
});
DateCell.displayName = "DateCell";

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

export const suppliersColumns = (onEdit, onDelete) => [
  {
    id: 'code',
    header: 'Code',
    cell: ({ row }) => <CodeCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: 'name',
    header: 'Name',
    cell: ({ row }) => <NameCell item={row.original} />,
    enableSorting: true,
  },
  {
    id: 'contactPerson',
    header: 'Contact',
    cell: ({ row }) => <ContactCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: 'phone',
    header: 'Phone',
    cell: ({ row }) => <PhoneCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: 'type',
    header: 'Type',
    cell: ({ row }) => <TypeCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: 'paymentTerms',
    header: 'Payment',
    cell: ({ row }) => <PaymentTermsCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: 'isActive',
    header: 'Status',
    cell: ({ row }) => <StatusCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: 'createdAt',
    header: 'Created',
    cell: ({ row }) => <DateCell item={row.original} />,
    enableSorting: true,
  },
  {
    id: 'actions',
    header: <div className="text-center">Actions</div>,
    enableSorting: false,
    cell: ({ row }) => {
      const item = row.original;
      const items = [
        { label: 'Edit', icon: Pencil, onClick: () => onEdit?.(item) },
      ];

      // Only show delete option if onDelete is provided (admin only)
      if (onDelete) {
        items.push({
          label: 'Deactivate',
          icon: Pencil,
          onClick: () => onDelete?.(item),
          variant: 'destructive'
        });
      }

      return (
        <div className="flex items-center justify-center">
          <ActionDropdown items={items} />
        </div>
      );
    }
  }
];
