import { Layout } from "@/components/layout/Layout";
import { ClientProviders } from "@/components/providers/ClientProvider";
import { auth } from "../(auth)/auth";

export const metadata = {
    title: "BigBoss - Premium Streetwear & Fashion",
    description: "Discover premium streetwear and fashion at BigBoss. Shop the latest collections, exclusive drops, and limited edition pieces.",
};

export default async function HomeLayout({ children }) {
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

    // Get token for cart
    const token = session?.accessToken || null;

    return (
        <ClientProviders>
            <Layout user={user} token={token}>
                {children}
            </Layout>
        </ClientProviders>
    );
}
