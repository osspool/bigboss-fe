import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { format } from "date-fns";

export const couponsColumns = (handleEdit, handleDelete) => [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        {row.original.code}
      </Badge>
    ),
  },
  {
    accessorKey: "discountType",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.discountType}
      </Badge>
    ),
  },
  {
    accessorKey: "discountAmount",
    header: "Discount",
    cell: ({ row }) => {
      const amount = row.original.discountAmount;
      const type = row.original.discountType;
      return type === "percentage" ? `৳{amount}%` : `৳${amount}`;
    },
  },
  {
    accessorKey: "minOrderAmount",
    header: "Min. Order",
    cell: ({ row }) => `৳${row.original.minOrderAmount}`,
  },
  {
    accessorKey: "usageLimit",
    header: "Usage Limit",
  },
  {
    accessorKey: "usedCount",
    header: "Used",
  },
  {
    accessorKey: "expiresAt",
    header: "Expires At",
    cell: ({ row }) => format(new Date(row.original.expiresAt), "PPP"),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleEdit(row.original)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-red-600"
            onClick={() => handleDelete(row.original._id)}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];