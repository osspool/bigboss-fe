"use client";

import { useState, useEffect, type ReactNode } from "react";

export interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * ClientOnly - Renders children only on the client side
 * Useful for components that rely on browser APIs or cause hydration mismatches
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return fallback;
  }

  return <>{children}</>;
}

/**
 * Hook to check if component is mounted on client
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
