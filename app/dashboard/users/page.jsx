import { auth } from "@/app/(auth)/auth";
import { UsersClient } from "./UsersClient";
import { AccessDenied } from "../components/AccessDenied";
import { isAdminUser, normalizeRoles } from "@/lib/access-control";
import { PageHeader } from "@classytic/clarity/dashboard";
import { ModeToggle } from "@classytic/clarity";

export default async function UsersPage() {
  const session = await auth();
  const token = session?.accessToken ?? "";
  const userRoles = session?.roles ?? session?.user?.roles ?? ["user"];

  if (!isAdminUser(normalizeRoles(userRoles))) {
    return (
      <AccessDenied
        user={session?.user}
        title="User Management: Admin Only"
        description="you don't have permission to manage staff accounts."
      />
    );
  }

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "User Management", current: true },
  ];

  return (
    <div className="flex flex-1 flex-col gap-2">
      <PageHeader items={breadcrumbItems} actions={<ModeToggle />} />
      <div className="flex-1">
        <UsersClient token={token} userRoles={userRoles} />
      </div>
    </div>
  );
}
