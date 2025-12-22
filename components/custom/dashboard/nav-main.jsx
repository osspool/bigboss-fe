"use client";

import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export function NavMain({ items = [] }) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isMobile = useIsMobile();

  const isActiveExact = (url) => pathname === url;
  const isActivePartial = (url) => pathname === url || pathname.startsWith(`${url}/`);

  const groups = useMemo(() => items || [], [items]);

  return (
    <nav aria-label="Main navigation" className="space-y-3">
      {groups.map((group) => (
        <SidebarGroup key={group.title} className="py-2">
          <SidebarGroupLabel className="px-3 text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/60">
            {group.title}
          </SidebarGroupLabel>
          <SidebarMenu className="gap-1.5">
            {group.items.map((item) => {
              const hasChildren = Array.isArray(item.items) && item.items.length > 0;
              const defaultOpen = !isMobile && isActivePartial(item.url);
              return (
                <Collapsible key={item.title} asChild defaultOpen={defaultOpen}>
                  <SidebarMenuItem className="rounded-md">
                    <SidebarMenuButton
                      asChild
                      className="h-9 px-3 text-[13px] font-medium text-sidebar-foreground/90 transition-colors"
                      tooltip={state === "collapsed" ? item.title : undefined}
                      isActive={isActiveExact(item.url)}
                    >
                      <Link href={item.url} aria-current={isActiveExact(item.url) ? "page" : undefined} title={item.title}>
                        {item.icon && (
                          <item.icon className="h-4 w-4 text-sidebar-foreground/70" />
                        )}
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>

                    {hasChildren && (
                      <>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuAction
                            className="ml-auto h-7 w-7 rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent/70 transition-colors data-[state=open]:rotate-90"
                            aria-label={`Toggle ${item.title} submenu`}
                            aria-expanded={defaultOpen}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </SidebarMenuAction>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="ml-3 gap-1 border-l border-sidebar-border/70 pl-3">
                            {item.items.map((sub) => (
                              <SidebarMenuSubItem key={sub.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  className="h-8 px-2.5 text-[13px] text-sidebar-foreground/80 transition-colors"
                                  isActive={isActiveExact(sub.url)}
                                >
                                  <Link href={sub.url} aria-current={isActiveExact(sub.url) ? "page" : undefined}>
                                    <span className="truncate">{sub.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </nav>
  );
}
