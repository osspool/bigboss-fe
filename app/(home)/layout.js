import { Layout } from "@/components/layout/Layout";
import { ClientProviders } from "@/components/providers/ClientProvider";
import { CategoryProvider } from "@/contexts/CategoryContext";
import { categoryApi } from "@/api/platform/category-api";
import { auth } from "../(auth)/auth";

export const metadata = {
    title: "BigBoss - Premium Streetwear & Fashion",
    description: "Discover premium streetwear and fashion at BigBoss. Shop the latest collections, exclusive drops, and limited edition pieces.",
};

/**
 * Prefetch category tree on the server
 * Cached via Next.js fetch cache for optimal performance
 */
async function getCategoryTree() {
    try {
        const response = await categoryApi.getTree({
            options: {
                next: { revalidate: 3600 }, // Cache for 1 hour
            }
        });
        return response?.data || [];
    } catch (error) {
        console.error("Failed to fetch category tree:", error);
        return [];
    }
}

export default async function HomeLayout({ children }) {
    // Parallel fetch for better performance
    const [session, categoryTree] = await Promise.all([
        auth(),
        getCategoryTree(),
    ]);

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
            <CategoryProvider initialTree={categoryTree}>
                <Layout user={user} token={token}>
                    {children}
                </Layout>
            </CategoryProvider>
        </ClientProviders>
    );
}
