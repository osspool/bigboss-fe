"use client";

import * as React from "react";
import { LayoutDashboard } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { NavMain } from "@/components/custom/dashboard/nav-main";
import { NavSecondary } from "@/components/custom/dashboard/nav-secondary";
import { NavUser } from "@/components/custom/dashboard/nav-user";
import { BranchSwitcher } from "@/components/custom/dashboard/branch-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { data } from "./sidebar-data";
import { SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function AppSidebar({ admin, user, userRoles = [], ...props }) {
  const { isMobile, state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const normalizedUserRoles = React.useMemo(() => {
    if (Array.isArray(userRoles)) {
      return userRoles
        .flat()
        .filter((r) => r != null)
        .map((r) => (typeof r === "string" ? r : String(r)).trim().toLowerCase());
    }
    if (typeof userRoles === "string") {
      return [userRoles.trim().toLowerCase()];
    }
    return [];
  }, [userRoles]);

  const hasAccess = (itemRoles) => {
    if (!itemRoles || itemRoles.length === 0) {
      return true;
    }
    const normalizedItemRoles = itemRoles
      .filter((r) => r != null)
      .map((r) => (typeof r === "string" ? r : String(r)).trim().toLowerCase());
    return normalizedItemRoles.some((role) => normalizedUserRoles.includes(role));
  };

  const filteredNavMain = data.navMain
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => hasAccess(item.roles)),
    }))
    .filter((section) => section.items.length > 0);

  const filteredNavSecondary = data.navSecondary.filter((item) =>
    hasAccess(item.roles)
  );

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      {isMobile && (
        <VisuallyHidden>
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Application navigation menu containing links to different sections
            of the application
          </SheetDescription>
        </VisuallyHidden>
      )}
      <SidebarHeader className="gap-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              tooltip={isCollapsed ? "HRM" : undefined}
            >
              <a
                href="/"
                className={cn(
                  "flex items-center text-sidebar-foreground",
                  isCollapsed && !isMobile && "justify-center"
                )}
              >
                <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
                  <LayoutDashboard
                    size={18}
                    className="text-sidebar-primary-foreground"
                  />
                </div>
                <span
                  className={cn(
                    "ml-2 font-semibold tracking-tight",
                    !isMobile && isCollapsed && "hidden"
                  )}
                >
                  Bigboss Admin
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <BranchSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {admin ? (
          <NavMain items={data.adminMain} />
        ) : (
          <>
            <NavMain items={filteredNavMain} />
            <NavSecondary items={filteredNavSecondary} className="mt-auto" />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
