"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { verifyManagerAuth, DISCOUNT_ALLOWED_ROLES } from "@classytic/commerce-sdk/auth";
import type { User, UserRoleType } from "@classytic/commerce-sdk/auth";

export interface ManagerAuthState {
  isAuthorized: boolean;
  authorizedBy: User | null;
  authorizedAt: Date | null;
}

interface UseManagerAuthOptions {
  allowedRoles?: UserRoleType[];
  /** Session duration in minutes (default: 30) */
  sessionDuration?: number;
}

/**
 * Hook for temporary manager authentication in POS
 * Used to authorize privileged actions like discounts
 */
export function useManagerAuth(options: UseManagerAuthOptions = {}) {
  const {
    allowedRoles = DISCOUNT_ALLOWED_ROLES,
    sessionDuration = 30,
  } = options;

  const [authState, setAuthState] = useState<ManagerAuthState>({
    isAuthorized: false,
    authorizedBy: null,
    authorizedAt: null,
  });

  // Check if session is still valid
  const isSessionValid = useCallback(() => {
    if (!authState.isAuthorized || !authState.authorizedAt) {
      return false;
    }
    const expiresAt = new Date(authState.authorizedAt.getTime() + sessionDuration * 60 * 1000);
    return new Date() < expiresAt;
  }, [authState.isAuthorized, authState.authorizedAt, sessionDuration]);

  // Verify credentials mutation
  const verifyMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const result = await verifyManagerAuth({
        email: credentials.email,
        password: credentials.password,
        allowedRoles,
      });

      if (!result.success) {
        throw new Error(result.message || "Authorization failed");
      }

      return result.user!;
    },
    onSuccess: (user) => {
      setAuthState({
        isAuthorized: true,
        authorizedBy: user,
        authorizedAt: new Date(),
      });
    },
  });

  // Clear authorization
  const clearAuth = useCallback(() => {
    setAuthState({
      isAuthorized: false,
      authorizedBy: null,
      authorizedAt: null,
    });
  }, []);

  // Verify and authorize
  const authorize = useCallback(
    async (email: string, password: string) => {
      return verifyMutation.mutateAsync({ email, password });
    },
    [verifyMutation]
  );

  return {
    // State
    isAuthorized: authState.isAuthorized && isSessionValid(),
    authorizedBy: authState.authorizedBy,
    authorizedAt: authState.authorizedAt,

    // Actions
    authorize,
    clearAuth,

    // Mutation state
    isPending: verifyMutation.isPending,
    error: verifyMutation.error?.message || null,
    reset: verifyMutation.reset,
  };
}

export { DISCOUNT_ALLOWED_ROLES };
export type { UserRoleType };
