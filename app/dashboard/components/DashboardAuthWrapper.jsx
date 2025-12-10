import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";

import { AppSidebar } from "@/components/custom/dashboard/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AccessDenied } from "./AccessDenied";

/**
 * This component handles the auth check in an async context.
 * It must be wrapped in <Suspense> to avoid blocking the entire page.
 * 
 * Flow:
 * 1. No session → redirect to login
 * 2. Logged in but not admin → show AccessDenied with logout option
 * 3. Admin user → show dashboard
 * 
 * @see https://nextjs.org/docs/messages/blocking-route
 */
export async function DashboardAuthWrapper({ children }) {
  const session = await auth();
  
  // Not logged in at all → redirect to login
  if (!session || !session?.user) {
    redirect("/login");
  }

  // Logged in but not admin → show access denied with logout option
  if (!session?.roles?.includes('admin')) {
    return <AccessDenied user={session.user} />;
  }

  // Admin user → show full dashboard
  return (
    <SidebarProvider>
      <AppSidebar user={session?.user} userRoles={session?.roles} />
      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2 px-4">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
