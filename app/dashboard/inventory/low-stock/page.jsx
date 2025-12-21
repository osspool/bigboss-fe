import { auth } from "@/app/(auth)/auth";
import { PageHeader } from "@/components/custom/dashboard/page-header";
import { AccessDenied } from "@/app/dashboard/components/AccessDenied";
import { canViewInventory } from "@/lib/access-control";
import { InventoryNav, LowStockClient } from "@/feature/inventory";

export const metadata = {
  title: "Low Stock Alerts | Inventory",
  description: "View products with low stock levels",
};

export default async function LowStockPage() {
  const session = await auth();
  const token = session?.accessToken ?? "";
  const roles = session?.roles ?? session?.user?.roles ?? [];
  const branchRoles = session?.branch?.roles ?? [];

  if (!canViewInventory(roles, branchRoles)) {
    return <AccessDenied />;
  }

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Inventory", href: "/dashboard/inventory" },
    { label: "Low Stock", current: true },
  ];

  return (
    <div className="flex flex-1 flex-col gap-2">
      <PageHeader items={breadcrumbItems} />
      <div className="px-4">
        <InventoryNav />
      </div>
      <div className="flex-1 px-4">
        <LowStockClient token={token} />
      </div>
    </div>
  );
}
