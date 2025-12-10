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
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                size="sm"
                tooltip={isCollapsed ? item.title : undefined}
              >
                <Link 
                  href={item.url} 
                  target={item?.target}
                  className={cn(
                    "flex items-center gap-2",
                    isCollapsed && "justify-center"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className={cn(isCollapsed && "hidden")}>
                    {item.title}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}