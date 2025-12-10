"use client";

import { useSyncExternalStore, useDeferredValue } from "react";

/**
 * ClientOnly Component - React 19.2 Best Practice
 *
 * Uses useSyncExternalStore instead of useEffect for better performance:
 * - Avoids double-render penalty during client-side navigation
 * - SSR/SEO safe - returns null during server rendering
 * - Prevents hydration mismatches
 * - useDeferredValue mitigates blocking render impact on Core Web Vitals
 *
 * @see https://react.dev/reference/react/useSyncExternalStore
 * @see https://tkdodo.eu/blog/avoiding-hydration-mismatches-with-use-sync-external-store
 */

// Empty subscribe function - never updates since client state is constant
const emptySubscribe = () => () => {};

// Server always returns false (not rendered)
const getServerSnapshot = () => false;

// Client always returns true (rendered)
const getClientSnapshot = () => true;

/**
 * Hook to detect if we're on the client side
 * Uses useDeferredValue to avoid blocking render impact on INP/Core Web Vitals
 */
export function useIsClient() {
  const isClientSync = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  // Use deferred value to make the transition non-blocking
  return useDeferredValue(isClientSync);
}

/**
 * ClientOnly wrapper component
 * Only renders children on the client side
 * Returns null during SSR to prevent hydration errors
 *
 * @example
 * <ClientOnly>
 *   <ComponentWithMathRandom />
 * </ClientOnly>
 *
 * @example
 * <ClientOnly fallback={<Skeleton />}>
 *   <ClientOnlyComponent />
 * </ClientOnly>
 */
export function ClientOnly({ children, fallback = null }) {
  const isClient = useIsClient();

  return isClient ? <>{children}</> : <>{fallback}</>;
}
