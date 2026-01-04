import { auth } from "@/app/(auth)/auth";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PlatformConfigForm } from "./components/platform-config-form";
import { PageHeader } from "@classytic/clarity/dashboard";
import { ModeToggle } from "@classytic/clarity";

export const metadata = {
  title: "Platform Configuration",
  description: "Manage platform-wide settings including payment methods and policies",
};

export default async function PlatformConfigPage() {
  const session = await auth();

  // Only super admins can access this page
  if (!session || !session.roles?.includes("superadmin")) {
    notFound();
  }

  const breadcrumbItems = [
    { label: "Super Admin", href: "/super" },
    { label: "Platform Config", current: true },
  ];

  return (
    <div className="flex flex-1 flex-col gap-2">
      <PageHeader items={breadcrumbItems} actions={<ModeToggle />} />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Platform Configuration</h1>
            <p className="text-sm text-muted-foreground">
              Manage platform-wide settings including payment methods and policies.
            </p>
          </div>

          <Suspense fallback={<div className="flex justify-center items-center h-64">Loading configuration...</div>}>
            <PlatformConfigForm token={session.accessToken} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

