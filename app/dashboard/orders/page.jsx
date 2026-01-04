import { auth } from "@/app/(auth)/auth";
import { OrdersClient } from "./OrdersClient";
import { PageHeader } from "@classytic/clarity/dashboard";
import { ModeToggle } from "@classytic/clarity";

export const metadata = {
  title: "Orders | Dashboard",
  description: "Manage customer orders",
};

export default async function OrdersPage({ searchParams }) {
  const session = await auth();
  const accessToken = session?.accessToken || "";

  const { limit = 15 } = await searchParams;
  const parsedLimit = Number(limit) || 15;

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Orders", current: true },
  ];

  return (
    <div className="flex flex-1 flex-col gap-2">
      <PageHeader items={breadcrumbItems} actions={<ModeToggle />} />
      <div className="flex-1">
        <OrdersClient
          token={accessToken}
          initialLimit={parsedLimit}
        />
      </div>
    </div>
  );
}
