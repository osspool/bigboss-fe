"use client";
import React from "react";
import { User, Mail, Calendar, Pencil, Shield, Building2, CheckCircle, XCircle, Lock } from "lucide-react";
import { ActionDropdown } from "@/components/custom/ui/dropdown-wrapper";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

const NameCell = React.memo(({ item }) => {
  const name = item.name || "-";
  const isSuperAdmin = item.roles?.includes('superadmin');

  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <User className="h-4 w-4 text-muted-foreground" />
      <span>{name}</span>
      {isSuperAdmin && (
        <Tooltip>
          <TooltipTrigger>
            <Shield className="h-4 w-4 text-red-500" />
          </TooltipTrigger>
          <TooltipContent>Super Admin</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
});
NameCell.displayName = "NameCell";

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

const RolesCell = React.memo(({ item }) => {
  const roles = item.roles || [];
  const roleColors = {
    superadmin: 'bg-red-50 text-red-700 border-red-200',
    admin: 'bg-orange-50 text-orange-700 border-orange-200',
    user: 'bg-gray-50 text-gray-700 border-gray-200',
    'finance-admin': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'finance-manager': 'bg-green-50 text-green-700 border-green-200',
    'store-manager': 'bg-blue-50 text-blue-700 border-blue-200',
    'warehouse-admin': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'warehouse-staff': 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div className="flex flex-wrap gap-1">
      {roles.length > 0 ? (
        roles.slice(0, 2).map((role) => (
          <span
            key={role}
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${roleColors[role] || roleColors.user}`}
          >
            {role.replace(/-/g, ' ')}
          </span>
        ))
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      )}
      {roles.length > 2 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border bg-gray-50 text-gray-700 border-gray-200 cursor-help">
              +{roles.length - 2}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {roles.slice(2).join(', ')}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
});
RolesCell.displayName = "RolesCell";

const BranchesCell = React.memo(({ item }) => {
  const branches = item.branches || [];

  if (branches.length === 0) {
    return <span className="text-muted-foreground text-sm">-</span>;
  }

  const primaryBranch = branches.find(b => b.isPrimary) || branches[0];

  return (
    <div className="flex items-center gap-2 text-sm">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="truncate max-w-[120px] cursor-help">
            {primaryBranch.branchName || primaryBranch.branchCode || 'Branch'}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            {branches.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <span>{b.branchName || b.branchCode}</span>
                {b.isPrimary && <Badge variant="outline" className="text-xs">Primary</Badge>}
                {b.roles?.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ({b.roles.map(r => r.replace(/_/g, ' ')).join(', ')})
                  </span>
                )}
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
      {branches.length > 1 && (
        <Badge variant="secondary" className="text-xs">+{branches.length - 1}</Badge>
      )}
    </div>
  );
});
BranchesCell.displayName = "BranchesCell";

const StatusCell = React.memo(({ item }) => {
  const isActive = item.isActive;
  return (
    <div className="flex items-center gap-2">
      {isActive ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3" />
          Active
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border bg-red-50 text-red-700 border-red-200">
          <XCircle className="h-3 w-3" />
          Inactive
        </span>
      )}
    </div>
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

const LastLoginCell = React.memo(({ item }) => {
  const dateStr = item.lastLoginAt;
  if (!dateStr) {
    return <span className="text-muted-foreground text-sm">Never</span>;
  }
  const display = new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  return (
    <span className="text-sm text-muted-foreground">{display}</span>
  );
});
LastLoginCell.displayName = "LastLoginCell";

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

export const usersColumns = (onEdit, onDelete, options = {}) => {
  const { isSuperAdmin = false } = options;

  return [
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
      id: 'email',
      header: 'Email',
      cell: ({ row }) => <EmailCell item={row.original} />,
      enableSorting: false,
    },
    {
      id: 'roles',
      header: 'Roles',
      cell: ({ row }) => <RolesCell item={row.original} />,
      enableSorting: false,
    },
    {
      id: 'branches',
      header: 'Branches',
      cell: ({ row }) => <BranchesCell item={row.original} />,
      enableSorting: false,
    },
    {
      id: 'isActive',
      header: 'Status',
      cell: ({ row }) => <StatusCell item={row.original} />,
      enableSorting: false,
    },
    {
      id: 'lastLoginAt',
      header: 'Last Login',
      cell: ({ row }) => <LastLoginCell item={row.original} />,
      enableSorting: true,
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
        const isTargetSuperAdmin = item.roles?.includes('superadmin');
        const canEditSuperAdmin = isSuperAdmin || !isTargetSuperAdmin;

        const items = [];

        // Edit action - visible to all, but disabled for non-superadmins editing superadmins
        if (canEditSuperAdmin) {
          items.push({
            label: 'Edit',
            icon: Pencil,
            onClick: () => onEdit?.(item),
          });
        } else {
          items.push({
            label: 'Edit (Superadmin Only)',
            icon: Lock,
            disabled: true,
            onClick: () => {},
          });
        }

        // Only show delete option if onDelete is provided (superadmin only)
        if (onDelete) {
          if (canEditSuperAdmin) {
            items.push({
              label: 'Delete',
              icon: Pencil,
              onClick: () => onDelete?.(item),
              variant: 'destructive'
            });
          } else {
            items.push({
              label: 'Delete (Superadmin Only)',
              icon: Lock,
              disabled: true,
              onClick: () => {},
              variant: 'destructive'
            });
          }
        }

        return (
          <div className="flex items-center justify-center">
            <ActionDropdown items={items} />
          </div>
        );
      }
    }
  ];
};
