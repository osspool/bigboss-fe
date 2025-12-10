import { Layout } from "@/components/layout/Layout";
import { auth } from "./auth";

export default async function AuthLayout({ children }) {
  const session = await auth();

  // Format user data for the Layout component
  const user = session?.user ? {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    roles: session.user.roles,
    phone: session.user.phone,
  } : null;

  return (
    <Layout user={user}>
      <div className="flex items-center justify-center py-12">
        {children}
      </div>
    </Layout>
  );
}
