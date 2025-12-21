import { auth } from "@/app/(auth)/auth";
import { PageHeader } from "@/components/custom/dashboard/page-header";
import { BranchesClient } from "./BranchesClient";
import { AccessDenied } from "../components/AccessDenied";
import { canManageBranches, normalizeRoles } from "@/lib/access-control";

export default async function BranchesPage() {
  const session = await auth();
  const token = session?.accessToken ?? "";
  const roles = normalizeRoles(session?.roles ?? session?.user?.roles);

  if (!canManageBranches(roles)) {
    return (
      <AccessDenied
        user={session?.user}
        title="Branches: Admin Only"
        description="you don't have permission to create/update branches."
      />
    );
  }

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Branches", current: true },
  ];

  return (
    <div className="flex flex-1 flex-col gap-2">
      <PageHeader items={breadcrumbItems} />
      <div className="flex-1">
        <BranchesClient token={token} />
      </div>
    </div>
  );
}
