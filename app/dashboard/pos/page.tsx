import { auth } from "@/app/(auth)/auth";
import { PageHeader } from "@/components/custom/dashboard/page-header";
import { PosClient } from "@/feature/pos";

export const metadata = {
  title: "POS | Dashboard",
  description: "Point of Sale system for in-store operations",
};

export default async function PosPage() {
  const session = await auth();
  const token = session?.accessToken ?? "";

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "POS", current: true },
  ];

  return (
    <div className="flex flex-1 flex-col gap-2">
      <PageHeader items={breadcrumbItems} />
      <div className="flex-1 min-h-0">
        <PosClient token={token} />
      </div>
    </div>
  );
}
