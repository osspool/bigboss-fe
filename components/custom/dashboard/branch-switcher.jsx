"use client";

import { useBranch } from "@/contexts/BranchContext";
import { Building2, Check, ChevronsUpDown, MapPin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function BranchSwitcher() {
  const {
    branches,
    selectedBranch,
    switchBranch,
    hasMultipleBranches,
    isLoading,
  } = useBranch();
  const { isMobile, state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Loading state
  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            className={cn(
              "h-10 py-1.5 bg-sidebar-accent/50",
              isCollapsed && !isMobile && "justify-center"
            )}
            disabled
          >
            <Skeleton className="h-4 w-4 rounded-sm shrink-0" />
            {!isCollapsed && (
              <div className="flex-1 min-w-0 space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2.5 w-14" />
              </div>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Don't show if no branch selected yet
  if (!selectedBranch) {
    return null;
  }

  // If only one branch, show it without dropdown
  if (!hasMultipleBranches) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            className={cn(
              "h-10 py-1.5 bg-sidebar-accent/50",
              isCollapsed && !isMobile && "justify-center"
            )}
            title={isCollapsed ? selectedBranch.name : undefined}
            disabled
          >
            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
            {!isCollapsed && (
              <div className="flex-1 min-w-0 leading-tight">
                <p className="text-xs font-medium truncate">
                  {selectedBranch.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {selectedBranch.code}
                </p>
              </div>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Multiple branches - show with dropdown
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <SidebarMenuButton
            asChild
              className={cn(
                "h-10 py-1.5 bg-sidebar-accent/50 hover:bg-sidebar-accent transition-colors",
                isCollapsed && !isMobile && "justify-center"
              )}
              title={isCollapsed ? selectedBranch.name : undefined}
          >
            <DropdownMenuTrigger type="button">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0 text-left leading-tight">
                    <p className="text-xs font-medium truncate">
                      {selectedBranch.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {selectedBranch.code}
                    </p>
                  </div>
                  <ChevronsUpDown className="h-3 w-3 text-muted-foreground shrink-0" />
                </>
              )}
            </DropdownMenuTrigger>
          </SidebarMenuButton>
          <DropdownMenuContent
            className="w-64 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              Switch Branch
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {branches.map((branch) => (
              <DropdownMenuItem
                key={branch._id}
                onClick={() => switchBranch(branch._id)}
                className="gap-2 cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm truncate">
                      {branch.name}
                    </span>
                    {selectedBranch?._id === branch._id && (
                      <Check className="size-3.5 text-primary shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {branch.code}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <Badge variant="outline" className="text-[10px] h-4 px-1">
                      {branch.type}
                    </Badge>
                    {branch.isDefault && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] h-4 px-1"
                      >
                        Default
                      </Badge>
                    )}
                    {!branch.isActive && (
                      <Badge
                        variant="destructive"
                        className="text-[10px] h-4 px-1"
                      >
                        Inactive
                      </Badge>
                    )}
                  </div>
                  {branch.address?.city && (
                    <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                      <MapPin className="size-2.5" />
                      {branch.address.city}
                    </div>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
