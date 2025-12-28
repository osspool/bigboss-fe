"use client";
import React from "react";
import { Ruler, Hash, Calendar, Pencil, Check, X, Trash, FileText } from "lucide-react";
import { ActionDropdown } from "@/components/custom/ui/dropdown-wrapper";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

const NameCell = React.memo(({ item }) => {
  const name = item.name || "-";
  const labelCount = item.measurementLabels?.length || 0;

  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
        <Ruler className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{name}</span>
        {labelCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {labelCount} measurement{labelCount > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
});
NameCell.displayName = "NameCell";

const SlugCell = React.memo(({ item }) => {
  const slug = item.slug || "-";
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Hash className="h-4 w-4" />
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="truncate max-w-[140px] cursor-help font-mono text-xs">{slug}</span>
        </TooltipTrigger>
        <TooltipContent>{slug}</TooltipContent>
      </Tooltip>
    </div>
  );
});
SlugCell.displayName = "SlugCell";

const UnitCell = React.memo(({ item }) => {
  const unit = item.measurementUnit || "inches";
  return (
    <Badge variant="outline" className="text-xs">
      {unit === "cm" ? "Centimeters" : "Inches"}
    </Badge>
  );
});
UnitCell.displayName = "UnitCell";

const SizesCountCell = React.memo(({ item }) => {
  const count = item.sizes?.length || 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <FileText className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium">{count}</span>
    </div>
  );
});
SizesCountCell.displayName = "SizesCountCell";

const DisplayOrderCell = React.memo(({ item }) => {
  const order = item.displayOrder ?? 0;
  return (
    <div className="text-sm text-center font-mono">
      {order}
    </div>
  );
});
DisplayOrderCell.displayName = "DisplayOrderCell";

const StatusCell = React.memo(({ item }) => {
  const isActive = item.isActive ?? true;
  return (
    <Badge variant={isActive ? "success" : "secondary"} className="gap-1">
      {isActive ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {isActive ? "Active" : "Inactive"}
    </Badge>
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
        <div className="text-xs font-mono text-muted-foreground truncate max-w-[100px] cursor-help">{id}</div>
      </TooltipTrigger>
      <TooltipContent>{id}</TooltipContent>
    </Tooltip>
  );
});
IdCell.displayName = "IdCell";

export const sizeGuideColumns = (onEdit, onDelete) => [
  {
    id: '_id',
    header: 'ID',
    cell: ({ row }) => <IdCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: 'name',
    header: 'Size Guide',
    cell: ({ row }) => <NameCell item={row.original} />,
    enableSorting: true,
  },
  {
    id: 'slug',
    header: 'Slug',
    cell: ({ row }) => <SlugCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: 'measurementUnit',
    header: 'Unit',
    cell: ({ row }) => <UnitCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: 'sizes',
    header: 'Sizes',
    cell: ({ row }) => <SizesCountCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: 'displayOrder',
    header: 'Order',
    cell: ({ row }) => <DisplayOrderCell item={row.original} />,
    enableSorting: true,
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

      // Only show delete option if onDelete is provided
      if (onDelete) {
        items.push({
          label: 'Delete',
          icon: Trash,
          onClick: () => onDelete?.(item),
          variant: 'destructive',
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
