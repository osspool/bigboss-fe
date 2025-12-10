import type { Metadata } from "next";
import { Bebas_Neue, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/Providers";

const bebasNeue = Bebas_Neue({
  variable: "--font-display",
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BigBoss - Premium Streetwear & Fashion",
  description: "Discover premium streetwear and fashion at BigBoss. Shop the latest collections, exclusive drops, and limited edition pieces.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bebasNeue.variable} ${inter.variable} ${geistMono.variable} antialiased`}
      >
       <Providers>{children}</Providers>
      </body>
    </html>
  );
}
