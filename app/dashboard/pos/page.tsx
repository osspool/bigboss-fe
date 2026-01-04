import { auth } from "@/app/(auth)/auth";
import { PosClient } from "@/feature/pos";
import { PageHeader } from "@classytic/clarity/dashboard";
import { ModeToggle } from "@classytic/clarity";

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
    <div className="absolute inset-0 flex flex-col gap-2">
      <div className="mx-4">
        
      <PageHeader items={breadcrumbItems} actions={<ModeToggle />} />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <PosClient token={token} />
      </div>
    </div>
  );
}
