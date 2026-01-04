import { auth } from "@/app/(auth)/auth";
import { InventoryNav, TransfersClient } from "@/feature/inventory";
import { PageHeader } from "@classytic/clarity/dashboard";
import { ModeToggle } from "@classytic/clarity";

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
      <PageHeader items={breadcrumbItems} actions={<ModeToggle />} />

      <InventoryNav />

      <div className="flex-1">
        <TransfersClient token={token} />
      </div>
    </div>
  );
}
