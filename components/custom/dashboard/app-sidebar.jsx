"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import { signOut } from "next-auth/react";
import { useBranch } from "@/contexts/BranchContext";
import { InsetSidebar } from "@classytic/clarity/dashboard";
import { data } from "./sidebar-data";

/**
 * AppSidebar - Main dashboard sidebar using clarity's InsetSidebar.
 * Handles role-based navigation filtering and branch switching.
 */
export function AppSidebar({ admin, user, userRoles = [], ...props }) {
  const pathname = usePathname();
  const { branches, selectedBranch, switchBranch, hasMultipleBranches, isLoading } = useBranch();

  // Normalize user roles for comparison
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

  // Check if user has access to a nav item
  const hasAccess = (itemRoles) => {
    if (!itemRoles || itemRoles.length === 0) return true;
    const normalizedItemRoles = itemRoles
      .filter((r) => r != null)
      .map((r) => (typeof r === "string" ? r : String(r)).trim().toLowerCase());
    return normalizedItemRoles.some((role) => normalizedUserRoles.includes(role));
  };

  // Check if a URL is active
  const isActiveUrl = (url) => pathname === url;

  // Transform navigation data to clarity format with role filtering and active state
  const transformNavigation = (groups) => {
    return groups
      .map((group) => ({
        title: group.title,
        items: group.items
          .filter((item) => hasAccess(item.roles))
          .map((item) => ({
            title: item.title,
            url: item.url,
            icon: item.icon,
            isActive: isActiveUrl(item.url),
            items: item.items?.map((sub) => ({
              title: sub.title,
              url: sub.url,
            })),
          })),
      }))
      .filter((group) => group.items.length > 0);
  };

  // Transform secondary navigation
  const transformSecondaryNavigation = (items) => {
    return [{
      items: items
        .filter((item) => hasAccess(item.roles))
        .map((item) => ({
          title: item.title,
          url: item.url,
          icon: item.icon,
          isActive: isActiveUrl(item.url),
        })),
    }];
  };

  // Transform branches to ProjectSwitcher format
  const branchItems = React.useMemo(() => {
    return branches.map((branch) => ({
      id: branch._id,
      name: branch.name,
      code: branch.code,
      type: branch.type,
      isDefault: branch.isDefault,
      isActive: branch.isActive,
      subtitle: branch.address?.city,
    }));
  }, [branches]);

  const selectedBranchItem = selectedBranch ? {
    id: selectedBranch._id,
    name: selectedBranch.name,
    code: selectedBranch.code,
    type: selectedBranch.type,
    isDefault: selectedBranch.isDefault,
    isActive: selectedBranch.isActive,
    subtitle: selectedBranch.address?.city,
  } : undefined;

  const handleBranchSelect = (project) => {
    switchBranch(project.id);
  };

  // Navigation data
  const navigation = admin
    ? transformNavigation(data.adminMain)
    : transformNavigation(data.navMain);

  const secondaryNavigation = admin
    ? undefined
    : transformSecondaryNavigation(data.navSecondary);

  // User menu configuration
  const userConfig = user ? {
    data: {
      name: user.name || "User",
      email: user.email || "",
      avatar: user.avatar || user.image,
    },
    onLogout: () => signOut({ redirectTo: "/login" }),
  } : undefined;

  // Project/Branch switcher configuration
  const projectConfig = hasMultipleBranches || selectedBranch ? {
    items: branchItems,
    selected: selectedBranchItem,
    onSelect: handleBranchSelect,
    isLoading,
    label: "Switch Branch",
  } : undefined;

  return (
    <InsetSidebar
      brand={{
        title: "Bigboss Admin",
        icon: <LayoutDashboard size={18} />,
        href: "/",
      }}
      navigation={navigation}
      secondaryNavigation={secondaryNavigation}
      project={projectConfig}
      user={userConfig}
      {...props}
    />
  );
}
