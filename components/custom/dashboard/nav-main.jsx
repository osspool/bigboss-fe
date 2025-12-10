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
import { cn } from "@/lib/utils";
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
        <SidebarGroup key={group.title} className="mt-1">
          <SidebarGroupLabel className="text-[11px] tracking-wide text-muted-foreground/90 px-2">
            {group.title}
          </SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {group.items.map((item) => {
              const hasChildren = Array.isArray(item.items) && item.items.length > 0;
              const defaultOpen = !isMobile && isActivePartial(item.url);
              return (
                <Collapsible key={item.title} asChild defaultOpen={defaultOpen}>
                  <SidebarMenuItem className="rounded-md">
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "h-9 px-2 rounded-md hover:bg-accent/70",
                        "data-[active=true]:bg-primary/10 data-[active=true]:text-primary",
                        "transition-colors"
                      )}
                      tooltip={state === "collapsed" ? item.title : undefined}
                      isActive={isActiveExact(item.url)}
                    >
                      <Link href={item.url} aria-current={isActiveExact(item.url) ? "page" : undefined} title={item.title}>
                        {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>

                    {hasChildren && (
                      <>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuAction
                            className="ml-auto h-8 w-8 rounded-md hover:bg-accent/70 transition-colors data-[state=open]:rotate-90"
                            aria-label={`Toggle ${item.title} submenu`}
                            aria-expanded={defaultOpen}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </SidebarMenuAction>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="ml-2 border-l pl-2">
                            {item.items.map((sub) => (
                              <SidebarMenuSubItem key={sub.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  className={cn(
                                    "h-8 px-2 rounded-md hover:bg-accent/60",
                                    "data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                                  )}
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