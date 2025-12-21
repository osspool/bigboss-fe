import { auth } from "@/app/(auth)/auth";
import { PageHeader } from "@/components/custom/dashboard/page-header";
import { InventoryNav, MovementsClient } from "@/feature/inventory";

export const metadata = {
  title: "Movements | Inventory",
  description: "Stock movement audit trail",
};

export default async function MovementsPage() {
  const session = await auth();
  const token = session?.accessToken ?? "";

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Inventory", href: "/dashboard/inventory" },
    { label: "Movements", current: true },
  ];

  return (
    <div className="flex flex-1 flex-col gap-2">
      <PageHeader items={breadcrumbItems} />
      <div className="px-4">
        <InventoryNav />
      </div>
      <div className="flex-1 px-4">
        <MovementsClient token={token} />
      </div>
    </div>
  );
}
