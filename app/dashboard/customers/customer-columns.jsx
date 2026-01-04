"use client";
import React from "react";
import { User, Phone, Mail, Calendar, Pencil, Award } from "lucide-react";
import { ActionDropdown } from "@classytic/clarity";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getReadableTextColor, getTierColor } from "@/lib/loyalty-utils";

const NameCell = React.memo(({ item }) => {
  const name = item.name || "-";
  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <User className="h-4 w-4 text-muted-foreground" />
      <span>{name}</span>
    </div>
  );
});
NameCell.displayName = "NameCell";

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

const EmailCell = React.memo(({ item }) => {
  const email = item.email || "-";
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Mail className="h-4 w-4" />
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="truncate max-w-[180px] cursor-help">{email}</span>
        </TooltipTrigger>
        <TooltipContent>{email}</TooltipContent>
      </Tooltip>
    </div>
  );
});
EmailCell.displayName = "EmailCell";

const GenderCell = React.memo(({ item }) => {
  const gender = item.gender || "-";
  const genderColors = {
    male: 'bg-blue-50 text-blue-700 border-blue-200',
    female: 'bg-pink-50 text-pink-700 border-pink-200',
    other: 'bg-purple-50 text-purple-700 border-purple-200',
    'prefer-not-to-say': 'bg-gray-50 text-gray-700 border-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border capitalize ${genderColors[gender] || genderColors['prefer-not-to-say']}`}>
      {gender.replace(/-/g, ' ')}
    </span>
  );
});
GenderCell.displayName = "GenderCell";

const StatsCell = React.memo(({ item }) => {
  const totalOrders = item.stats?.orders?.total || 0;
  const revenuePence = item.stats?.revenue?.total || 0;
  const revenuePounds = (revenuePence / 100).toFixed(2); // Convert pence to pounds
  return (
    <div className="flex flex-col gap-1">
      <div className="text-sm font-medium">{totalOrders} orders</div>
      <div className="text-xs text-muted-foreground">৳{revenuePounds}</div>
    </div>
  );
});
StatsCell.displayName = "StatsCell";

const MembershipCell = React.memo(({ item }) => {
  const membership = item.membership;
  if (!membership?.cardId) {
    return (
      <div className="text-xs text-muted-foreground">Not enrolled</div>
    );
  }
  const tierName = membership.tier;
  const tierColor = getTierColor(tierName);
  const tierTextColor = getReadableTextColor(tierColor);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Award className="h-4 w-4 text-muted-foreground" />
        <span className="font-mono">{membership.cardId}</span>
      </div>
      <div className="text-xs text-muted-foreground">
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium mr-2"
          style={
            tierColor
              ? { backgroundColor: tierColor, color: tierTextColor }
              : undefined
          }
        >
          {tierName || "Tier"}
        </span>
        {membership.points?.current ?? 0} pts
      </div>
    </div>
  );
});
MembershipCell.displayName = "MembershipCell";

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

export const customersColumns = (onEdit, onDelete) => [
  {
    id: '_id',
    header: 'ID',
    cell: ({ row }) => <IdCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: 'name',
    header: 'Name',
    cell: ({ row }) => <NameCell item={row.original} />,
    enableSorting: true,
  },
  {
    id: 'phone',
    header: 'Phone',
    cell: ({ row }) => <PhoneCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: 'email',
    header: 'Email',
    cell: ({ row }) => <EmailCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: 'gender',
    header: 'Gender',
    cell: ({ row }) => <GenderCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: 'stats',
    header: 'Stats',
    cell: ({ row }) => <StatsCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: 'membership',
    header: 'Membership',
    cell: ({ row }) => <MembershipCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: 'createdAt',
    header: 'Joined',
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
          label: 'Delete',
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
