import { auth } from "@/app/(auth)/auth";
import { PageHeader } from "@/components/custom/dashboard/page-header";
import { CMSLibraryClient } from "./CMSLibraryClient";

export default async function CMSLibraryPage() {
  const session = await auth();
  const token = session?.accessToken ?? "";
  const userRole = session?.user?.role ?? "user";

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Pages", current: true },
  ];

  return (
    <div className="flex flex-1 flex-col gap-2">
      <PageHeader items={breadcrumbItems} />
      <div className="flex-1">
        <CMSLibraryClient token={token} userRole={userRole} />
      </div>
    </div>
  );
}
