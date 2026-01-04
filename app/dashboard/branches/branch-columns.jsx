"use client";
import React from "react";
import { Store, Phone, Mail, MapPin, Calendar, Pencil, Trash2, Star, Hash } from "lucide-react";
import { ActionDropdown } from "@classytic/clarity";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

const CodeCell = React.memo(({ item }) => {
  const code = item.code || "-";
  return (
    <div className="flex items-center gap-2 text-sm font-mono">
      <Hash className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium">{code}</span>
    </div>
  );
});
CodeCell.displayName = "CodeCell";

const NameCell = React.memo(({ item }) => {
  const name = item.name || "-";
  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <Store className="h-4 w-4 text-muted-foreground" />
      <span>{name}</span>
      {item.isDefault && (
        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
      )}
    </div>
  );
});
NameCell.displayName = "NameCell";

const TypeCell = React.memo(({ item }) => {
  const type = item.type || "store";
  const typeColors = {
    store: "bg-blue-50 text-blue-700 border-blue-200",
    warehouse: "bg-amber-50 text-amber-700 border-amber-200",
    outlet: "bg-green-50 text-green-700 border-green-200",
    franchise: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border capitalize ${typeColors[type] || typeColors.store}`}>
      {type}
    </span>
  );
});
TypeCell.displayName = "TypeCell";

const StatusCell = React.memo(({ item }) => {
  const isActive = item.isActive !== false;
  return (
    <Badge variant={isActive ? "default" : "secondary"}>
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
});
StatusCell.displayName = "StatusCell";

const ContactCell = React.memo(({ item }) => {
  const phone = item.phone || "-";
  const email = item.email;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Phone className="h-3.5 w-3.5" />
        <span>{phone}</span>
      </div>
      {email && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Mail className="h-3 w-3" />
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="truncate max-w-[150px] cursor-help">{email}</span>
            </TooltipTrigger>
            <TooltipContent>{email}</TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
});
ContactCell.displayName = "ContactCell";

const AddressCell = React.memo(({ item }) => {
  const address = item.address;
  if (!address) return <span className="text-muted-foreground text-sm">-</span>;

  const parts = [address.line1, address.city, address.state].filter(Boolean);
  const display = parts.join(", ") || "-";

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <MapPin className="h-4 w-4 shrink-0" />
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="truncate max-w-[200px] cursor-help">{display}</span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            {address.line1 && <div>{address.line1}</div>}
            {address.line2 && <div>{address.line2}</div>}
            {(address.city || address.state) && (
              <div>{[address.city, address.state].filter(Boolean).join(", ")}</div>
            )}
            {address.postalCode && <div>{address.postalCode}</div>}
            {address.country && <div>{address.country}</div>}
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
});
AddressCell.displayName = "AddressCell";

const DateCell = React.memo(({ item }) => {
  const dateStr = item.createdAt;
  const display = dateStr ? new Date(dateStr).toLocaleDateString("en-GB") : "-";
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
        <div className="text-xs font-mono text-muted-foreground truncate max-w-[100px] cursor-help">
          {id}
        </div>
      </TooltipTrigger>
      <TooltipContent>{id}</TooltipContent>
    </Tooltip>
  );
});
IdCell.displayName = "IdCell";

export const branchColumns = (onEdit, onDelete) => [
  {
    id: "_id",
    header: "ID",
    cell: ({ row }) => <IdCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: "code",
    header: "Code",
    cell: ({ row }) => <CodeCell item={row.original} />,
    enableSorting: true,
  },
  {
    id: "name",
    header: "Name",
    cell: ({ row }) => <NameCell item={row.original} />,
    enableSorting: true,
  },
  {
    id: "type",
    header: "Type",
    cell: ({ row }) => <TypeCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => <StatusCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: "contact",
    header: "Contact",
    cell: ({ row }) => <ContactCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: "address",
    header: "Address",
    cell: ({ row }) => <AddressCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: "createdAt",
    header: "Created",
    cell: ({ row }) => <DateCell item={row.original} />,
    enableSorting: true,
  },
  {
    id: "actions",
    header: <div className="text-center">Actions</div>,
    enableSorting: false,
    cell: ({ row }) => {
      const item = row.original;
      const items = [
        { label: "Edit", icon: Pencil, onClick: () => onEdit?.(item) },
      ];

      if (onDelete) {
        items.push({
          label: "Delete",
          icon: Trash2,
          onClick: () => onDelete?.(item),
          variant: "destructive",
        });
      }

      return (
        <div className="flex items-center justify-center">
          <ActionDropdown items={items} />
        </div>
      );
    },
  },
];
