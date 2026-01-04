import { auth } from "@/app/(auth)/auth";
import { TransactionsClient } from "./TransactionsClient";
import { PageHeader } from "@classytic/clarity/dashboard";
import { ModeToggle } from "@classytic/clarity";

export default async function ParlourTransactionsPage() {
  const session = await auth();
  const token = session?.accessToken ?? "";
  const userRoles = session?.user?.roles ?? [];

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Transactions", current: true },
  ];

  return (
    <div className="flex flex-1 flex-col gap-2">
      <PageHeader items={breadcrumbItems} actions={<ModeToggle />} />
      <div className="flex-1">
        <TransactionsClient token={token} userRoles={userRoles} />
      </div>
    </div>
  );
}
