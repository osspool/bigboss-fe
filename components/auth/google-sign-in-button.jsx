"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "../custom/ui/soical-icons";
import { Loader2 } from "lucide-react";

export function GoogleSignInButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("google", {
        callbackUrl: "/",
      });
    } catch (error) {
      console.error("Google sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="w-full retro-button retro-button-secondary"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      <span className="ml-2">Sign in with Google</span>
    </Button>
  );
} 