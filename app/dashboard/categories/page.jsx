import { auth } from "@/app/(auth)/auth";
import { PageHeader } from "@classytic/clarity/dashboard";
import { ModeToggle } from "@classytic/clarity";
import { CategoriesClient } from "./CategoryClient";

export default async function CategoriesPage() {
  const session = await auth();
  const token = session?.accessToken ?? "";
  const userRoles = session?.user?.roles ?? [];

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Categories", current: true },
  ];

  return (
    <div className="flex flex-1 flex-col gap-2">
      <PageHeader items={breadcrumbItems} actions={<ModeToggle />} />
      <div className="flex-1">
        <CategoriesClient token={token} userRoles={userRoles} />
      </div>
    </div>
  );
}
