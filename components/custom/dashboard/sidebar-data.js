import {
  Package,
  SquareTerminal,
  LayoutDashboard,
  Box,
  Wallet,
  Cpu,
  Users,
  Cog,
  Building2Icon,
  Tag,
  ImagesIcon,
  FileText,
  ShoppingCart,
  TicketPercent,
  ArrowLeftRight,
} from "lucide-react";

import { UserRole } from "@/api/user-data";



export const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  adminMain: [
    {
      title: "Admin",
      items: [
        {
          title: "Dashboard",
          url: "/super",
          icon: SquareTerminal,
          isActive: true,
          items: [],
        },
        {
          title: "Subscription",
          url: "/super/subscription",
          icon: Cpu,
          items: [],
        },
      ],
    },
  ],
  navMain: [
    {
      title: "Portal",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
          isActive: true,
          items: [],
          roles: ["admin", "superadmin", "store-manager", "finance-admin", "finance-manager", "warehouse-admin", "warehouse-staff"],
        },
        {
          title: "Media Library",
          url: "/dashboard/media",
          icon: ImagesIcon,
          isActive: true,
          items: [],
          roles: ["admin", "superadmin", "store-manager", "warehouse-admin", "warehouse-staff"],
        },
      ],
    },
    {
      title: "Inventory",
      items: [
        {
          title: "Suppliers",
          url: "/dashboard/suppliers",
          icon: Building2Icon,
          isActive: true,
          items: [],
          roles: ["admin", "superadmin", "store-manager", "warehouse-admin", "warehouse-staff"],
        },
        {
          title: "POS",
          url: "/dashboard/pos",
          icon: SquareTerminal,
          isActive: true,
          items: [],
          roles: ["admin", "superadmin", "store-manager", "warehouse-staff"],
        },
        {
          title: "Inventory",
          url: "/dashboard/inventory",
          icon: Box,
          isActive: true,
          items: [
            {
              title: "Stock Levels",
              url: "/dashboard/inventory",
            },
            {
              title: "Low Stock Alerts",
              url: "/dashboard/inventory/low-stock",
            },
            {
              title: "Transfers (Challan)",
              url: "/dashboard/inventory/transfers",
            },
            {
              title: "Stock Requests",
              url: "/dashboard/inventory/requests",
            },
            {
              title: "Purchases",
              url: "/dashboard/inventory/purchases",
            },
            {
              title: "Stock Movements",
              url: "/dashboard/inventory/movements",
            },
          ],
          roles: ["admin", "superadmin", "store-manager", "warehouse-admin", "warehouse-staff", "finance-admin", "finance-manager"],
        },
        {
          title: "Branches",
          url: "/dashboard/branches",
          icon: Building2Icon,
          isActive: true,
          items: [],
          roles: ["admin", "superadmin", "warehouse-admin"],
        },
      ],
    },
    {
      // title: "Configuration",
      title: "Commerce",
      items: [
        {
          title: "Products",
          url: "/dashboard/products",
          icon: Package,
          roles: [ UserRole.STORE_MANAGER,"admin","superadmin"],
        },
        {
          title: "Categories",
          url: "/dashboard/categories",
          icon: Tag,
          roles: [ UserRole.STORE_MANAGER,"admin","superadmin"],
        },
        {
          title: "Pages",
          url: "/dashboard/cms",
          icon: FileText,
          roles: [ UserRole.STORE_MANAGER,"admin","superadmin"],
        },
        {
          title: "Orders",
          url: "/dashboard/orders",
          icon: ShoppingCart,
          roles: [ UserRole.STORE_MANAGER,"admin","superadmin"],
        },
        {
          title: "Customers",
          url: "/dashboard/customers",
          icon: Users,
          roles: [ UserRole.STORE_MANAGER,"admin","superadmin"],
        },
        {
          title: "Coupons",
          url: "/dashboard/coupons",
          icon: TicketPercent,
          roles: [ UserRole.STORE_MANAGER,"admin","superadmin"],
        },
      ],
    },
    {
      // title: "Configuration",
      title: "Finance",
      items: [
        {
          title: "Finance Overview",
          url: "/dashboard/finance",
          icon: Wallet,
          roles: ["admin","superadmin","finance-admin","finance-manager"],
        },
        {
          title: "Transactions",
          url: "/dashboard/transactions",
          icon: ArrowLeftRight,
          roles: ["admin","superadmin","finance-admin","finance-manager","store-manager"],
        }
      ],
    },
    // {
    //     // title: "Configuration",
    //     title: "Operations",
    //     items: [
    //         {
    //             title: "Listings",
    //             url: "/dashboard/listings",
    //             icon: ListIcon,
    //         },
    //     ],
    // },
  ],
  navSecondary: [
    {
      title: "User Management",
      url: "/dashboard/users",
      icon: Users,
      roles: ["admin", "superadmin"],
    },
    {
      title: "Settings",
      url: "/dashboard/platform-config",
      icon: Cog,
      roles: ["superadmin"],
    },
  ],
};
