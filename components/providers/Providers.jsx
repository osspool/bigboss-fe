"use client";

import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { SessionProvider } from "next-auth/react";
import TanstackProvider from "./react-query";
import { TooltipProvider } from "../ui/tooltip";

// SDK Configuration
import { configureSDK, configureToast } from "@classytic/commerce-sdk";

// Configure SDK at module load (runs once)
configureSDK({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
});

// Configure toast handlers
configureToast({
  success: toast.success,
  error: toast.error,
});

const Providers = ({ children }) => {
  return (
    <SessionProvider
      refetchInterval={15 * 60} // Refetch session every 5 minutes (300 seconds)
      refetchOnWindowFocus={true} // Refetch when window regains focus
    >
      <TanstackProvider>
        {/* ThemeProvider commented out - single theme only, no dark/light mode */}
        {/* Uncomment below when dark/light mode is needed */}
        {/* <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        > */}
          <Toaster position="top-center" />
          <TooltipProvider>{children}</TooltipProvider>
        {/* </ThemeProvider> */}
      </TanstackProvider>
    </SessionProvider>
  );
};

export default Providers;
