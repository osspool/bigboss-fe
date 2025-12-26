import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";

import { AppSidebar } from "@/components/custom/dashboard/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AccessDenied } from "./AccessDenied";
import { BranchProvider } from "@/contexts/BranchContext";
import { isAdminUser, normalizeRoles } from "@/lib/access-control";

/**
 * This component handles the auth check in an async context.
 * It must be wrapped in <Suspense> to avoid blocking the entire page.
 *
 * Flow:
 * 1. No session → redirect to login
 * 2. Logged in but not staff/assigned to a branch → show AccessDenied
 * 3. Staff user → show dashboard with BranchProvider
 *
 * @see https://nextjs.org/docs/messages/blocking-route
 */
export async function DashboardAuthWrapper({ children }) {
  const session = await auth();

  // Not logged in at all → redirect to login
  if (!session || !session?.user) {
    redirect("/login");
  }

  if (session?.isActive === false) {
    return (
      <AccessDenied
        user={session.user}
        title="Account Disabled"
        description="your account is inactive. Please contact an administrator."
      />
    );
  }

  const roles = normalizeRoles(session?.roles ?? session?.user?.roles);
  const admin = isAdminUser(roles);

  const effectiveAdmin = admin || session?.isAdmin === true || roles.includes("superadmin");

  const branchIds = Array.isArray(session?.branchIds) ? session.branchIds : [];
  const fallbackBranchId = session?.branch?.branchId ? [session.branch.branchId] : [];
  const allowedBranchIds = effectiveAdmin ? null : (branchIds.length ? branchIds : fallbackBranchId);

  if (!effectiveAdmin && Array.isArray(allowedBranchIds) && allowedBranchIds.length === 0) {
    return (
      <AccessDenied
        user={session.user}
        title="No Branch Access"
        description="your account is not assigned to any branch. Please contact an administrator."
      />
    );
  }

  const accessToken = session?.accessToken ?? "";
  const sidebarRoles = Array.from(
    new Set([
      ...roles,
      session?.isAdmin ? "admin" : null,
      session?.isWarehouseStaff ? "warehouse-staff" : null,
    ].filter(Boolean))
  );

  // Staff user → show dashboard with branch context
  return (
    <BranchProvider accessToken={accessToken} allowedBranchIds={allowedBranchIds}>
      <SidebarProvider>
        <AppSidebar user={session?.user} userRoles={sidebarRoles} />
        <SidebarInset>
          <div className="flex flex-1 flex-col min-h-0">
            <div className="@container/main flex flex-1 flex-col gap-2 px-4 min-h-0">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </BranchProvider>
  );
}
