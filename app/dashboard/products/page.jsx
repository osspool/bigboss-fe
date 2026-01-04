import { auth } from "@/app/(auth)/auth";
import { PageHeader } from "@classytic/clarity/dashboard";
import { ModeToggle } from "@classytic/clarity";
import { ProductsClient } from "./ProductClient";
import "@/components/form/lite-editor/markdown-preview.css";

export default async function ProductsPage() {
  const session = await auth();
  const token = session?.accessToken ?? "";
  const userRoles = session?.user?.roles ?? [];

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Products", current: true },
  ];

  return (
    <div className="flex flex-1 flex-col gap-2">
      <PageHeader items={breadcrumbItems} actions={<ModeToggle />} />
      <div className="flex-1">
        <ProductsClient token={token} userRoles={userRoles} />
      </div>
    </div>
  );
}
