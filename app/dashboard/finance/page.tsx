// app/dashboard/finance/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import FinanceClient from "./FinanceClient";

export const metadata = {
  title: "Finance | Dashboard",
  description: "Finance statements and summaries",
};

export default async function FinancePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check if user has finance access
  const userRoles = session.user.roles || [];
  const hasFinanceAccess = userRoles.some((role) =>
    ["admin", "superadmin", "finance-admin", "finance-manager"].includes(role)
  );

  if (!hasFinanceAccess) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
          <p className="text-muted-foreground">
            View financial statements and summaries
          </p>
        </div>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <FinanceClient />
      </Suspense>
    </div>
  );
}
