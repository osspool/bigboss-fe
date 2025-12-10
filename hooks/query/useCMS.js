"use client";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getCmsPage, updateCmsPage } from "@/api/platform/cms-api";
import { toast } from "sonner";

// ==================== Query Keys ====================

export const CMS_KEYS = {
  all: ["cms"],
  page: (slug) => ["cms", slug],
};

// ==================== Hooks ====================

/**
 * Fetch CMS page by slug
 * @param {string} slug - Page slug
 * @param {Object} options - React Query options
 */
export function useCMSPage(slug, options = {}) {
  return useQuery({
    queryKey: CMS_KEYS.page(slug),
    queryFn: async () => {
      const { data } = await getCmsPage({ slug });
      return data;
    },
    enabled: !!slug && options.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Update CMS page (admin)
 * Backend auto-creates if page doesn't exist
 * @param {string} token - Admin token
 */
export function useCMSUpdate(token) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, data }) => {
      return updateCmsPage({ slug, token, data });
    },
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: CMS_KEYS.page(slug) });
      toast.success("Page saved successfully");

      // Trigger ISR revalidation
      fetch("/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, type: "both" }),
      }).catch(console.error);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save page");
    },
  });
}
