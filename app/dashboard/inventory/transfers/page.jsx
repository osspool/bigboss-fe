import { auth } from "@/app/(auth)/auth";
import { PageHeader } from "@/components/custom/dashboard/page-header";
import { InventoryNav, TransfersClient } from "@/feature/inventory";

export const metadata = {
  title: "Transfers | Inventory",
  description: "Challan-based stock transfers between branches",
};

export default async function TransfersPage() {
  const session = await auth();
  const token = session?.accessToken ?? "";

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Inventory", href: "/dashboard/inventory" },
    { label: "Transfers", current: true },
  ];

  return (
    <div className="flex flex-1 flex-col gap-2">
      <PageHeader items={breadcrumbItems} />
      <div className="px-4">
        <InventoryNav />
      </div>
      <div className="flex-1 px-4">
        <TransfersClient token={token} />
      </div>
    </div>
  );
}
