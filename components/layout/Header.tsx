"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search, User, ChevronDown, ChevronRight, LogOut, Settings, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "./Container";
import { HeaderSearch } from "./HeaderSearch";
import { MobileSearchOverlay } from "./MobileSearchOverlay";
import { NAV_ITEMS, CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { CartBadge } from "@/components/platform/cart/CartBadge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string;
    roles?: string[];
    phone?: string;
  } | null;
  token?: string | null;
}

export function Header({ user, token }: HeaderProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const pathname = usePathname();
  const isLoggedIn = !!user;

  const toggleCategory = (slug: string) => {
    setOpenCategories(prev => 
      prev.includes(slug) 
        ? prev.filter(s => s !== slug)
        : [...prev, slug]
    );
  };

  const categoryEntries = Object.entries(CATEGORIES) as [string, typeof CATEGORIES[keyof typeof CATEGORIES]][];

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        {/* Announcement Bar */}
        <div className="bg-primary text-primary-foreground py-2 text-center text-sm">
          <Container>
            <p className="font-medium tracking-wide">
              FREE SHIPPING ON ORDERS OVER ৳5,000 | USE CODE: BIGBOSS10
            </p>
          </Container>
        </div>

        {/* Main Header */}
        <Container>
          <nav className="flex items-center justify-between h-16 md:h-20 gap-4">
            {/* Mobile Menu Button */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <button
                  className="lg:hidden p-2 -ml-2"
                  aria-label="Toggle menu"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 bg-background border-border">
                <SheetHeader className="p-6 border-b border-border">
                  <SheetTitle className="font-display text-2xl tracking-tight">
                    BIGBOSS
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex flex-col h-[calc(100%-80px)]">
                  {/* User Section */}
                  <div className="p-4 border-b border-border">
                    {isLoggedIn && user ? (
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1" 
                          size="sm"
                          asChild
                        >
                          <Link href="/login" onClick={() => setIsSheetOpen(false)}>
                            Sign In
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1" 
                          size="sm"
                          asChild
                        >
                          <Link href="/register" onClick={() => setIsSheetOpen(false)}>
                            Register
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex-1 overflow-y-auto py-4">
                    {/* New Arrivals Link */}
                    <Link
                      href="/products?category=new-arrivals"
                      onClick={() => setIsSheetOpen(false)}
                      className="flex items-center px-6 py-3 text-base font-medium hover:bg-accent transition-colors"
                    >
                      New Arrivals
                    </Link>

                    {/* Categories with Subcategories */}
                    {categoryEntries.map(([key, category]) => (
                      <Collapsible
                        key={key}
                        open={openCategories.includes(category.slug)}
                        onOpenChange={() => toggleCategory(category.slug)}
                      >
                        <CollapsibleTrigger className="flex items-center justify-between w-full px-6 py-3 text-base font-medium hover:bg-accent transition-colors">
                          <span>{category.label}</span>
                          <ChevronDown 
                            className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              openCategories.includes(category.slug) && "rotate-180"
                            )}
                          />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="bg-accent/50">
                          <Link
                            href={`/products?parentCategory=${category.slug}`}
                            onClick={() => setIsSheetOpen(false)}
                            className="block px-10 py-2.5 text-sm text-foreground hover:text-primary transition-colors"
                          >
                            View All {category.label}
                          </Link>
                          {category.subcategories.map((sub) => (
                            <Link
                              key={sub.slug}
                              href={`/products?parentCategory=${category.slug}&category=${sub.slug}`}
                              onClick={() => setIsSheetOpen(false)}
                              className="block px-10 py-2.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}

                    {/* Sale Link */}
                    <Link
                      href="/products?category=sale"
                      onClick={() => setIsSheetOpen(false)}
                      className="flex items-center px-6 py-3 text-base font-medium text-destructive hover:bg-accent transition-colors"
                    >
                      Sale
                    </Link>
                  </div>

                  {/* Bottom Actions for Logged In User */}
                  {isLoggedIn && (
                    <div className="border-t border-border p-4 space-y-1">
                      <Link
                        href="/profile/my-orders"
                        onClick={() => setIsSheetOpen(false)}
                        className="flex items-center gap-3 px-2 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                      >
                        <Package className="h-4 w-4" />
                        My Orders
                      </Link>
                      <Link
                        href="/account"
                        onClick={() => setIsSheetOpen(false)}
                        className="flex items-center gap-3 px-2 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        Account Settings
                      </Link>
                      <form action="/api/auth/signout" method="POST">
                        <button
                          type="submit"
                          onClick={() => setIsSheetOpen(false)}
                          className="flex items-center gap-3 px-2 py-2 text-sm text-destructive hover:bg-accent rounded-md transition-colors w-full"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <span className="font-display text-3xl md:text-4xl tracking-tight">BIGBOSS</span>
            </Link>

            {/* Desktop Navigation with Mega Menu */}
            <div className="hidden lg:flex items-center gap-6">
              {/* New Arrivals - Simple Link */}
              <Link
                href="/products?category=new-arrivals"
                className="text-sm font-medium tracking-wide uppercase transition-colors link-underline"
              >
                New
              </Link>

              {/* Categories with Mega Menu Dropdowns */}
              {categoryEntries
                .filter(([key]) => key !== "collections")
                .map(([key, category]) => (
                  <DropdownMenu modal={false} key={key}>
                    <DropdownMenuTrigger className="group flex items-center gap-1 text-sm font-medium tracking-wide uppercase transition-colors hover:text-primary outline-none">
                      {category.label}
                      <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="center" 
                      sideOffset={16}
                      className="w-[600px] p-0 bg-background border-border shadow-xl z-50"
                    >
                      <div className="grid grid-cols-3 gap-0">
                        {/* Category Image */}
                        <div className="col-span-1 relative overflow-hidden">
                          <img 
                            src={category.image || `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop`}
                            alt={category.label}
                            className="w-full h-full object-cover min-h-[280px]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white font-display text-xl font-bold mb-2">{category.label}</h3>
                            <Link 
                              href={`/products?parentCategory=${category.slug}`}
                              className="inline-flex items-center text-white text-sm font-medium hover:underline"
                            >
                              Shop All <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                          </div>
                        </div>

                        {/* Subcategories Grid */}
                        <div className="col-span-2 p-6">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                            Categories
                          </h4>
                          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                            {category.subcategories.map((sub) => (
                              <DropdownMenuItem key={sub.slug} asChild className="p-0">
                                <Link 
                                  href={`/products?parentCategory=${category.slug}&category=${sub.slug}`}
                                  className="flex items-center gap-3 py-2 px-0 cursor-pointer hover:text-primary transition-colors group/item"
                                >
                                  {sub.image && (
                                    <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                      <img 
                                        src={sub?.image ?? ""} 
                                        alt={sub.label}
                                        className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-300"
                                      />
                                    </div>
                                  )}
                                  <span className="text-sm font-medium">{sub.label}</span>
                                </Link>
                              </DropdownMenuItem>
                            ))}
                          </div>

                          {/* Featured Link */}
                          <div className="mt-6 pt-4 border-t border-border">
                            <Link 
                              href={`/products?parentCategory=${category.slug}`}
                              className="inline-flex items-center text-sm font-semibold text-primary hover:underline"
                            >
                              View All {category.label} <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ))}

              {/* Sale - Simple Link with highlight */}
              <Link
                href="/products?category=sale"
                className="text-sm font-medium tracking-wide uppercase transition-colors link-underline text-destructive"
              >
                Sale
              </Link>
            </div>

            {/* Desktop Search */}
            <div className="hidden lg:block flex-1 max-w-md mx-8">
              <HeaderSearch />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Mobile Search Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* User Account */}
              {isLoggedIn && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary text-sm font-semibold">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-background border-border">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile/my-orders" className="cursor-pointer">
                        <Package className="mr-2 h-4 w-4" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Account Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <form action="/api/auth/signout" method="POST">
                        <button
                          type="submit"
                          className="flex items-center text-destructive cursor-pointer w-full"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </button>
                      </form>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/login">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
              )}

              {/* Cart */}
              <CartBadge token={token} />
            </div>
          </nav>
        </Container>
      </header>

      {/* Mobile Search Overlay */}
      <MobileSearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
