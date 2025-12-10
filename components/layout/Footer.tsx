"use client";

import Link from "next/link";
import { Instagram, Twitter, Facebook } from "lucide-react";
import { Container } from "./Container";
import { FOOTER_LINKS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Newsletter Section */}
      <div className="py-16 md:py-24 border-b border-primary-foreground/20">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-3xl md:text-4xl mb-2 text-primary-foreground">JOIN THE MOVEMENT</h3>
              <p className="text-primary-foreground/70">
                Subscribe for exclusive drops, early access & 10% off your first order.
              </p>
            </div>
            <form className="flex w-full md:w-auto gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/50 min-w-[250px] focus-visible:ring-primary-foreground/50"
              />
              <Button variant="secondary" className="shrink-0 text-primary">
                Subscribe
              </Button>
            </form>
          </div>
        </Container>
      </div>

      {/* Links Section */}
      <div className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="inline-block mb-4">
                <span className="font-display text-4xl text-primary-foreground">BIGBOSS</span>
              </Link>
              <p className="text-primary-foreground/70 text-sm mb-4">
                Premium streetwear for those who dare to stand out.
              </p>
              <div className="flex gap-4 text-primary-foreground">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Link Groups */}
            {Object.values(FOOTER_LINKS).map((group) => (
              <div key={group.title}>
                <h4 className="font-medium text-sm uppercase tracking-wider mb-4 text-primary-foreground">
                  {group.title}
                </h4>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-primary-foreground/70 text-sm hover:text-primary-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/20 py-6">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/70">
            <p>© {new Date().getFullYear()} BigBoss. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span>Bangladesh</span>
              <span>৳ BDT</span>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
