import { auth } from "@/app/(auth)/auth";
import { PageHeader } from "@/components/custom/dashboard/page-header";
import { InventoryNav, RequestsClient } from "@/feature/inventory";

export const metadata = {
  title: "Stock Requests | Inventory",
  description: "Sub-branch stock requests to head office",
};

export default async function RequestsPage() {
  const session = await auth();
  const token = session?.accessToken ?? "";

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Inventory", href: "/dashboard/inventory" },
    { label: "Requests", current: true },
  ];

  return (
    <div className="flex flex-1 flex-col gap-2">
      <PageHeader items={breadcrumbItems} />
      <InventoryNav />
      <div className="flex-1">
        <RequestsClient token={token} />
      </div>
    </div>
  );
}
