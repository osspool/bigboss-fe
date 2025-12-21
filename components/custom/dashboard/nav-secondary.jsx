import * as React from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function NavSecondary({ items, ...props }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarGroup {...props} className={cn("pt-2", props.className)}>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1.5">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                size="sm"
                tooltip={isCollapsed ? item.title : undefined}
                className={cn(
                  "h-9 px-3 text-[13px] font-medium text-sidebar-foreground/90",
                  "hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
                  "transition-colors"
                )}
              >
                <Link
                  href={item.url}
                  target={item?.target}
                  className={cn("flex items-center gap-2.5", isCollapsed && "justify-center")}
                >
                  <item.icon className="h-4 w-4 text-sidebar-foreground/70" />
                  <span className={cn(isCollapsed && "hidden")}>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
