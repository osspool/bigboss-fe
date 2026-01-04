import { auth } from "@/app/(auth)/auth";
import { CouponClient } from "./CouponClient";
import { PageHeader } from "@classytic/clarity/dashboard";
import { ModeToggle } from "@classytic/clarity";

export default async function CouponsPage() {
  const session = await auth();
  const token = session?.accessToken ?? "";
  const userRoles = session?.user?.roles ?? [];

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Coupons", current: true },
  ];

  return (
    <div className="flex flex-1 flex-col gap-2">
      <PageHeader items={breadcrumbItems} actions={<ModeToggle />} />
      <div className="flex-1">
        <CouponClient token={token} userRoles={userRoles} />
      </div>
    </div>
  );
}
