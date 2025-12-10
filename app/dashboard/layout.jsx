import { Suspense } from "react";
import { DashboardAuthWrapper } from "./components/DashboardAuthWrapper";
import { DashboardSkeleton } from "./components/DashboardSkeleton";
import Providers from "@/components/providers/Providers";

/**
 * Dashboard Layout with Suspense boundary for auth check.
 *
 * In Next.js 16, accessing request-specific data (cookies, headers, auth sessions)
 * outside of a <Suspense> boundary blocks the entire page from rendering.
 *
 * By wrapping the auth-checking component in Suspense, Next.js can:
 * 1. Immediately show the loading skeleton
 * 2. Stream the authenticated content once the session is verified
 *
 * Providers wraps this layout to provide SessionProvider for auth state.
 *
 * @see https://nextjs.org/docs/messages/blocking-route
 */
export default function Layout({ children }) {
  return (
    <Providers>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardAuthWrapper>{children}</DashboardAuthWrapper>
      </Suspense>
    </Providers>
  );
}
