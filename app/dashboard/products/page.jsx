import { auth } from "@/app/(auth)/auth";
import { PageHeader } from "@/components/custom/dashboard/page-header";
import { ProductsClient } from "./ProductClient";
import "@/components/form/lite-editor/markdown-preview.css";

export default async function ProductsPage() {
  const session = await auth();
  const token = session?.accessToken ?? "";
  const userRole = session?.user?.role ?? "user";

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Products", current: true },
  ];

  return (
    <div className="flex flex-1 flex-col gap-2">
      <PageHeader items={breadcrumbItems} />
      <div className="flex-1">
        <ProductsClient token={token} userRole={userRole} />
      </div>
    </div>
  );
}
