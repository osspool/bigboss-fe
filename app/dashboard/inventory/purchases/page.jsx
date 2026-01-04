import { auth } from "@/app/(auth)/auth";
import { InventoryNav, PurchasesClient } from "@/feature/inventory";
import { PageHeader } from "@classytic/clarity/dashboard";
import { ModeToggle } from "@classytic/clarity";

export const metadata = {
  title: "Purchases | Inventory",
  description: "Head office stock entry (supplier purchases)",
};

export default async function PurchasesPage() {
  const session = await auth();
  const token = session?.accessToken ?? "";

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Inventory", href: "/dashboard/inventory" },
    { label: "Purchases", current: true },
  ];

  return (
    <div className="flex flex-1 flex-col gap-2">
      <PageHeader items={breadcrumbItems} actions={<ModeToggle />} />
      <InventoryNav />
      <div className="flex-1">
        <PurchasesClient token={token} />
      </div>
    </div>
  );
}
