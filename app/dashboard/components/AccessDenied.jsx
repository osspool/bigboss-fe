"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ShieldX, LogOut, Home, Mail } from "lucide-react";
import Link from "next/link";

/**
 * Shown when a logged-in user doesn't have permission to access the dashboard.
 * Provides clear messaging and a way to log out or go back home.
 */
export function AccessDenied({
  user,
  title = "Access Restricted",
  description = "Your account doesn't have permission to access this area.",
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
          <ShieldX className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Hi{user?.name ? ` ${user.name}` : ""}, {description}
          </p>
          {user?.email && (
            <p className="text-sm text-slate-500 dark:text-slate-500 flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              Logged in as: {user.email}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/">
              <Home className="w-4 h-4" />
              Go to Homepage
            </Link>
          </Button>
          
          <Button
            variant="destructive"
            className="gap-2"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        {/* Help text */}
        <p className="text-xs text-slate-500 dark:text-slate-600">
          If you believe you should have access, please contact an administrator.
        </p>
      </div>
    </div>
  );
}

