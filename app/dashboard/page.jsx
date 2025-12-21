// app/dashboard/page.jsx
import { auth } from "@/app/(auth)/auth";
import { PageHeader } from "@/components/custom/dashboard/page-header";
import { DashboardUi } from "./components/DashboardUi";

/**
 * Dashboard Page
 * 
 * Note: Auth and staff access checks are handled in the layout's
 * DashboardAuthWrapper component.
 */
export default async function DashboardPage() {
  const session = await auth();
  const accessToken = session?.accessToken;

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Dashboard", current: true },
  ];

  return (
    <div className="space-y-6">
      <PageHeader items={breadcrumbItems} />
      <div className="container px-4 py-6">
        <DashboardUi token={accessToken} />
      </div>
    </div>
  );
}
