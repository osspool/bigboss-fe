"use client";

import { memo, useState, useCallback } from "react";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ManagerAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthorize: (email: string, password: string) => Promise<unknown>;
  isPending: boolean;
  error: string | null;
  title?: string;
  description?: string;
}

export const ManagerAuthDialog = memo(function ManagerAuthDialog({
  open,
  onOpenChange,
  onAuthorize,
  isPending,
  error,
  title = "Manager Authorization Required",
  description = "Enter manager or admin credentials to authorize this action.",
}: ManagerAuthDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim() || !password.trim()) return;

      try {
        await onAuthorize(email.trim(), password);
        // Clear form on success
        setEmail("");
        setPassword("");
        onOpenChange(false);
      } catch {
        // Error is handled by the hook
      }
    },
    [email, password, onAuthorize, onOpenChange]
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        // Clear form when closing
        setEmail("");
        setPassword("");
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-500" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="manager-email">Email</Label>
            <Input
              id="manager-email"
              type="email"
              placeholder="manager@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manager-password">Password</Label>
            <Input
              id="manager-password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
              autoComplete="current-password"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isPending || !email.trim() || !password.trim()}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Authorize
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});
