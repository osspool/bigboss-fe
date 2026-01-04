import { MediaLibrary } from "@/feature/media";
import { auth } from "@/app/(auth)/auth";
import { PageHeader } from "@classytic/clarity/dashboard";
import { ModeToggle } from "@classytic/clarity";

export default async function MediaPage() {
  const session = await auth();
  const accessToken = session?.accessToken;

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Dashboard", current: true },
  ];

  return (
    <div className="flex flex-col -mx-4 -my-2 h-[calc(100dvh-3rem)]">
      <div className="px-4 pt-2">
        <PageHeader items={breadcrumbItems} actions={<ModeToggle />} />
      </div>
      <div className="flex-1 min-h-0">
        <MediaLibrary token={accessToken as string}/>
      </div>
    </div>
  );
}
