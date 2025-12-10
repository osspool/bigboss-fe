import {
  // ForkKnifeCrossedIcon,
  // Bot,
  // Command,
  // Frame,
  LifeBuoy,
  // Map,
  // PieChart,
  ListIcon,
  // NetworkIcon,
  // GalleryVerticalIcon,
  // File,
  // FileLock,
  // FileInput,
  // SpellCheck,
  // Users,
  // FileText,
  // Coins,
  // Building2,
  // UserCircle,
  // Wallet,
  // BookA,
  // BookUp2,
  // ListFilter,
  // DiamondPlusIcon,
  Package,
  // Send,
  // Settings2,
  SquareTerminal,
  LayoutDashboard,
  Box,
  Barcode,
  DollarSign,
  Send,
  SparklesIcon,
  PackagePlus,
  Settings,
  Key,
  LoaderPinwheel,
  CalendarClock,
  Clock,
  CalendarCheck,
  Wallet,
  Cpu,
  Users,
  Cog,
  BarChart3,
  Building2Icon,
  BookOpen,
  Tag,
  ImagesIcon,
  FileText,
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
          roles: [ "user"],
        },
        {
          title: "Media Library",
          url: "/dashboard/media",
          icon: ImagesIcon,
          isActive: true,
          items: [],
          roles: [ "user"],
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
          title: "Pages",
          url: "/dashboard/cms",
          icon: FileText,
          roles: [ UserRole.STORE_MANAGER,"admin","superadmin"],
        },
        {
          title: "Customers",
          url: "/dashboard/customers",
          icon: CalendarCheck,
          roles: ["user"],
        },
        {
          title: "Orders",
          url: "/dashboard/orders",
          icon: Package,
          roles: [ UserRole.STORE_MANAGER,"admin","superadmin"],
        },
        {
          title: "Coupons",
          url: "/dashboard/coupons",
          icon: Tag,
          roles: [ UserRole.STORE_MANAGER,"admin","superadmin"],
        },
      ],
    },
    {
      // title: "Configuration",
      title: "Finance",
      items: [
        {
          title: "Transactions",
          url: "/dashboard/transactions",
          icon: Wallet,
          roles: ["user"],
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
      roles: ["user","admin","superadmin"],
    },
    {
      title: "Settings",
      url: "/dashboard/platform-config",
      icon: Cog,
      roles: ["user","admin","superadmin"],
    },
  ],
};
