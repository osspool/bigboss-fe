"use client";

import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import TanstackProvider from "./react-query";
import { ThemeProvider } from "./theme-provider";
import { TooltipProvider } from "../ui/tooltip";

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
