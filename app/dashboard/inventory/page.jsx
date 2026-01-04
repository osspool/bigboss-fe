import { auth } from "@/app/(auth)/auth";
import { AccessDenied } from "@/app/dashboard/components/AccessDenied";
import { canViewInventory } from "@/lib/access-control";
import { InventoryNav, InventoryClient } from "@/feature/inventory";
import { PageHeader } from "@classytic/clarity/dashboard";
import { ModeToggle } from "@classytic/clarity";

export const metadata = {
  title: "Inventory | Dashboard",
  description: "Manage branch inventory and stock levels",
};

export default async function InventoryPage({ searchParams }) {
  const session = await auth();
  const token = session?.accessToken ?? "";
  const roles = session?.roles ?? session?.user?.roles ?? [];
  const branchRoles = session?.branch?.roles ?? [];

  // Check permissions
  if (!canViewInventory(roles, branchRoles)) {
    return <AccessDenied />;
  }

  const { limit = 50 } = await searchParams;
  const parsedLimit = Number(limit) || 50;

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Inventory", current: true },
  ];

  return (
    <div className="flex flex-1 flex-col gap-2">
      <PageHeader items={breadcrumbItems} actions={<ModeToggle />} />

        <InventoryNav />

      <div className="flex-1">
        <InventoryClient
          token={token}
          userRoles={roles}
          branchRoles={branchRoles}
          initialLimit={parsedLimit}
        />
      </div>
    </div>
  );
}
