// hooks/use-user-search.js
"use client";
import { useMutation } from "@tanstack/react-query";
import { getUser, getUserByPhone } from "@/api/user-data";

export function useUserSearch({ token }) {
  const searchUserMutation = useMutation({
    mutationFn: ({ value, by = "email" }) => {
      if (by === "phone") return getUserByPhone(value, token);
      return getUser(value, token);
    },
    onError: (error) => {
      // Error is handled by the component
      console.error("User search error:", error);
    },
  });

  return {
    // searchUser("017...", "phone") or searchUser("email@example.com")
    searchUser: (value, by = "email") => searchUserMutation.mutate({ value, by }),
    user: searchUserMutation.data?.docs?.[0],
    notFound: Array.isArray(searchUserMutation.data?.docs) && searchUserMutation.data.docs.length === 0,
    isSearching: searchUserMutation.isPending,
    error: searchUserMutation.error,
    reset: searchUserMutation.reset,
  };
}