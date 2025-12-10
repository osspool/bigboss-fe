"use client";
import React from "react";
import { Package, Tag, DollarSign, Layers, Calendar, Pencil, Trash2, Star, Eye, ShoppingCart } from "lucide-react";
import { ActionDropdown } from "@/components/custom/ui/dropdown-wrapper";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { cn } from "@/lib/utils";

const ImageCell = React.memo(({ item }) => {
  const imageUrl = item.featuredImage?.url || item.images?.[0]?.url;
  const alt = item.featuredImage?.alt || item.name;

  return (
    <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className="object-cover"
          sizes="48px"
          unoptimized
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <Package className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
});
ImageCell.displayName = "ImageCell";

const NameCell = React.memo(({ item }) => {
  const name = item.name || "-";
  const slug = item.slug || "";
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-medium line-clamp-1">{name}</span>
      <span className="text-xs text-muted-foreground font-mono">{slug}</span>
    </div>
  );
});
NameCell.displayName = "NameCell";

const PriceCell = React.memo(({ item }) => {
  const basePrice = item.basePrice || 0;
  const currentPrice = item.currentPrice || basePrice;
  const hasDiscount = currentPrice < basePrice;

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2">
        <span className={cn(
          "text-sm font-semibold",
          hasDiscount && "text-green-600"
        )}>
          ৳{currentPrice.toFixed(2)}
        </span>
        {hasDiscount && (
          <span className="text-xs line-through text-muted-foreground">
            ৳{basePrice.toFixed(2)}
          </span>
        )}
      </div>
      {item.discount?.type && item.isDiscountActive && (
        <Badge variant="secondary" className="text-xs w-fit">
          {item.discount.type === 'percentage' 
            ? `${item.discount.value}% off` 
            : `৳${item.discount.value} off`}
        </Badge>
      )}
    </div>
  );
});
PriceCell.displayName = "PriceCell";

const StockCell = React.memo(({ item }) => {
  const quantity = item.quantity || 0;
  const isLowStock = quantity > 0 && quantity <= 10;
  const isOutOfStock = quantity === 0;

  return (
    <div className="flex items-center gap-2">
      <span className={cn(
        "text-sm font-medium",
        isOutOfStock && "text-red-600",
        isLowStock && "text-yellow-600"
      )}>
        {quantity}
      </span>
      {isOutOfStock && (
        <Badge variant="destructive" className="text-xs">Out</Badge>
      )}
      {isLowStock && (
        <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-300">Low</Badge>
      )}
    </div>
  );
});
StockCell.displayName = "StockCell";

const CategoryCell = React.memo(({ item }) => {
  const category = item.category || "-";
  const parentCategory = item.parentCategory || "";
  return (
    <div className="flex flex-col gap-0.5">
      {parentCategory && (
        <span className="text-xs text-muted-foreground capitalize">{parentCategory}</span>
      )}
      <Badge variant="outline" className="text-xs w-fit capitalize">
        {category}
      </Badge>
    </div>
  );
});
CategoryCell.displayName = "CategoryCell";

const StatusCell = React.memo(({ item }) => {
  const isActive = item.isActive;
  return (
    <Badge 
      variant={isActive ? "default" : "secondary"}
      className={cn(
        "text-xs",
        isActive ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-600"
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
});
StatusCell.displayName = "StatusCell";

const StatsCell = React.memo(({ item }) => {
  const totalSales = item.stats?.totalSales || item.totalSales || 0;
  const viewCount = item.stats?.viewCount || 0;
  const rating = item.averageRating;
  const reviews = item.numReviews || 0;

  return (
    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        <ShoppingCart className="h-3 w-3" />
        <span>{totalSales} sold</span>
      </div>
      <div className="flex items-center gap-1">
        <Eye className="h-3 w-3" />
        <span>{viewCount} views</span>
      </div>
      {rating !== undefined && (
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span>{rating.toFixed(1)} ({reviews})</span>
        </div>
      )}
    </div>
  );
});
StatsCell.displayName = "StatsCell";

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
        <div className="text-xs font-mono text-muted-foreground truncate max-w-[100px] cursor-help">
          {id}
        </div>
      </TooltipTrigger>
      <TooltipContent>{id}</TooltipContent>
    </Tooltip>
  );
});
IdCell.displayName = "IdCell";

export const productColumns = (onEdit, onDelete) => [
  {
    id: 'image',
    header: '',
    cell: ({ row }) => <ImageCell item={row.original} />,
    enableSorting: false,
    size: 60,
  },
  {
    id: 'name',
    header: 'Product',
    cell: ({ row }) => <NameCell item={row.original} />,
    enableSorting: true,
  },
  {
    id: 'price',
    header: 'Price',
    cell: ({ row }) => <PriceCell item={row.original} />,
    enableSorting: true,
  },
  {
    id: 'quantity',
    header: 'Stock',
    cell: ({ row }) => <StockCell item={row.original} />,
    enableSorting: true,
  },
  {
    id: 'category',
    header: 'Category',
    cell: ({ row }) => <CategoryCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusCell item={row.original} />,
    enableSorting: false,
  },
  {
    id: 'stats',
    header: 'Stats',
    cell: ({ row }) => <StatsCell item={row.original} />,
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
          label: 'Delete',
          icon: Trash2,
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
